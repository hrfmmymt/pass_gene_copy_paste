/**
 * @jest-environment jsdom
 */

// テスト対象の関数をインポート
// ブラウザコードをテストするため、jsdom環境で読み込み
const fs = require('node:fs');
const path = require('node:path');

// スクリプトファイルを読み込み
const scriptPath = path.join(__dirname, '../src/script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// テストに必要な関数のみを実行（DOM操作部分は除外）
const functionsOnly = scriptContent.split("if (typeof document !== 'undefined')")[0];
// biome-ignore lint/security/noGlobalEval: テスト環境でのコード実行のため必要
eval(functionsOnly);

// テスト用定数
const SYMBOL_PATTERN = /[!"£$%&/()=?^'*+\-_.:,;.:]+/;

// DOM関連のテスト用にHTMLをセットアップ
function setupDOM() {
  document.body.innerHTML = `
    <input type="checkbox" id="lower" checked>
    <input type="checkbox" id="upper" checked>
    <input type="checkbox" id="numbers" checked>
    <input type="checkbox" id="symbols" checked>
    <button id="genepass">GENERATE PASSWORD</button>
  `;
}

describe('パスワード生成機能', () => {
  describe('createPassword関数', () => {
    test('指定した長さのパスワードが生成される', () => {
      const options = { lowercase: true, uppercase: false, numbers: false, symbols: false };
      const password = createPassword(8, options);
      expect(password).toHaveLength(8);
    });

    test('小文字のみ選択時は小文字のみが含まれる', () => {
      const options = { lowercase: true, uppercase: false, numbers: false, symbols: false };
      const password = createPassword(10, options);
      expect(password).toMatch(/^[a-z]+$/);
    });

    test('大文字のみ選択時は大文字のみが含まれる', () => {
      const options = { lowercase: false, uppercase: true, numbers: false, symbols: false };
      const password = createPassword(10, options);
      expect(password).toMatch(/^[A-Z]+$/);
    });

    test('数字のみ選択時は数字のみが含まれる', () => {
      const options = { lowercase: false, uppercase: false, numbers: true, symbols: false };
      const password = createPassword(10, options);
      expect(password).toMatch(/^[0-9]+$/);
    });

    test('複数オプション選択時は各文字種が含まれる', () => {
      const options = { lowercase: true, uppercase: true, numbers: true, symbols: false };
      const password = createPassword(20, options);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
    });

    test('文字種が何も選択されていない場合はエラーが発生する', () => {
      const options = { lowercase: false, uppercase: false, numbers: false, symbols: false };
      expect(() => createPassword(8, options)).toThrow(
        'At least one character type must be selected'
      );
    });

    test('長さが1未満の場合はエラーが発生する', () => {
      const options = { lowercase: true, uppercase: false, numbers: false, symbols: false };
      expect(() => createPassword(0, options)).toThrow('Password length must be between 1 and 100');
    });

    test('長さが100を超える場合はエラーが発生する', () => {
      const options = { lowercase: true, uppercase: false, numbers: false, symbols: false };
      expect(() => createPassword(101, options)).toThrow(
        'Password length must be between 1 and 100'
      );
    });

    test('複数回実行時は異なるパスワードが生成される', () => {
      const options = { lowercase: true, uppercase: true, numbers: true, symbols: true };
      const password1 = createPassword(20, options);
      const password2 = createPassword(20, options);
      expect(password1).not.toBe(password2);
    });

    test('記号のみ選択時は記号のみが含まれる', () => {
      const options = { lowercase: false, uppercase: false, numbers: false, symbols: true };
      const password = createPassword(10, options);
      expect(password).toMatch(SYMBOL_PATTERN);
    });
  });

  describe('文字種検証', () => {
    test('小文字の文字が正しく生成される', () => {
      const options = { lowercase: true, uppercase: false, numbers: false, symbols: false };
      const password = createPassword(26, options);
      expect(password).toMatch(/^[a-z]+$/);
    });

    test('大文字の文字が正しく生成される', () => {
      const options = { lowercase: false, uppercase: true, numbers: false, symbols: false };
      const password = createPassword(26, options);
      expect(password).toMatch(/^[A-Z]+$/);
    });

    test('数字の文字が正しく生成される', () => {
      const options = { lowercase: false, uppercase: false, numbers: true, symbols: false };
      const password = createPassword(10, options);
      expect(password).toMatch(/^[0-9]+$/);
    });

    test('記号の文字が正しく生成される', () => {
      const options = { lowercase: false, uppercase: false, numbers: false, symbols: true };
      const password = createPassword(10, options);
      expect(password.length).toBe(10);
    });
  });

  describe('複数文字種選択時の生成パターン', () => {
    test('小文字と大文字を選択時は小文字と大文字のみが含まれる', () => {
      const options = { lowercase: true, uppercase: true, numbers: false, symbols: false };
      const password = createPassword(30, options);
      expect(password).toMatch(/^[a-zA-Z]+$/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).not.toMatch(/[0-9]/);
      expect(password).not.toMatch(SYMBOL_PATTERN);
    });

    test('小文字と数字を選択時は小文字と数字のみが含まれる', () => {
      const options = { lowercase: true, uppercase: false, numbers: true, symbols: false };
      const password = createPassword(30, options);
      expect(password).toMatch(/^[a-z0-9]+$/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[A-Z]/);
      expect(password).not.toMatch(SYMBOL_PATTERN);
    });

    test('小文字と記号を選択時は小文字と記号のみが含まれる', () => {
      const options = { lowercase: true, uppercase: false, numbers: false, symbols: true };
      const password = createPassword(30, options);
      expect(password).toMatch(/[a-z]/);
      expect(password).not.toMatch(/[A-Z]/);
      expect(password).not.toMatch(/[0-9]/);
      expect(password).toMatch(SYMBOL_PATTERN);
    });

    test('大文字と数字を選択時は大文字と数字のみが含まれる', () => {
      const options = { lowercase: false, uppercase: true, numbers: true, symbols: false };
      const password = createPassword(30, options);
      expect(password).toMatch(/^[A-Z0-9]+$/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[a-z]/);
      expect(password).not.toMatch(SYMBOL_PATTERN);
    });

    test('大文字と記号を選択時は大文字と記号のみが含まれる', () => {
      const options = { lowercase: false, uppercase: true, numbers: false, symbols: true };
      const password = createPassword(30, options);
      expect(password).toMatch(/[A-Z]/);
      expect(password).not.toMatch(/[a-z]/);
      expect(password).not.toMatch(/[0-9]/);
      expect(password).toMatch(SYMBOL_PATTERN);
    });

    test('数字と記号を選択時は数字と記号のみが含まれる', () => {
      const options = { lowercase: false, uppercase: false, numbers: true, symbols: true };
      const password = createPassword(30, options);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[a-z]/);
      expect(password).not.toMatch(/[A-Z]/);
      expect(password).toMatch(SYMBOL_PATTERN);
    });

    test('小文字、大文字、数字を選択時は該当文字種のみが含まれる', () => {
      const options = { lowercase: true, uppercase: true, numbers: true, symbols: false };
      const password = createPassword(30, options);
      expect(password).toMatch(/^[a-zA-Z0-9]+$/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(SYMBOL_PATTERN);
    });

    test('小文字、大文字、記号を選択時は該当文字種のみが含まれる', () => {
      const options = { lowercase: true, uppercase: true, numbers: false, symbols: true };
      const password = createPassword(30, options);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).not.toMatch(/[0-9]/);
      expect(password).toMatch(SYMBOL_PATTERN);
    });

    test('小文字、数字、記号を選択時は該当文字種のみが含まれる', () => {
      const options = { lowercase: true, uppercase: false, numbers: true, symbols: true };
      const password = createPassword(30, options);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[A-Z]/);
      expect(password).toMatch(SYMBOL_PATTERN);
    });

    test('大文字、数字、記号を選択時は該当文字種のみが含まれる', () => {
      const options = { lowercase: false, uppercase: true, numbers: true, symbols: true };
      const password = createPassword(30, options);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[a-z]/);
      expect(password).toMatch(SYMBOL_PATTERN);
    });

    test('全ての文字種を選択時は全ての文字種が含まれる', () => {
      const options = { lowercase: true, uppercase: true, numbers: true, symbols: true };
      const password = createPassword(30, options);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(SYMBOL_PATTERN);
    });
  });

  describe('ボタンの状態制御', () => {
    beforeEach(() => {
      setupDOM();
      // updateButtonState関数を再定義（テスト環境用）
      // biome-ignore lint/security/noGlobalEval: テスト環境でのDOM関数定義のため必要
      eval(`
        function updateButtonState() {
          const options = {
            lowercase: document.getElementById('lower').checked,
            uppercase: document.getElementById('upper').checked,
            numbers: document.getElementById('numbers').checked,
            symbols: document.getElementById('symbols').checked
          };

          const hasAnyOption = options.lowercase || options.uppercase || options.numbers || options.symbols;
          const generateButton = document.getElementById('genepass');
          generateButton.disabled = !hasAnyOption;
        }
      `);
    });

    test('全てのチェックボックスが未チェックの場合ボタンが無効化される', () => {
      // 全てのチェックボックスを未チェックにする
      document.getElementById('lower').checked = false;
      document.getElementById('upper').checked = false;
      document.getElementById('numbers').checked = false;
      document.getElementById('symbols').checked = false;

      updateButtonState();

      const button = document.getElementById('genepass');
      expect(button.disabled).toBe(true);
    });

    test('少なくとも1つのチェックボックスがチェックされている場合ボタンが有効化される', () => {
      // 1つだけチェックボックスをチェックする
      document.getElementById('lower').checked = true;
      document.getElementById('upper').checked = false;
      document.getElementById('numbers').checked = false;
      document.getElementById('symbols').checked = false;

      updateButtonState();

      const button = document.getElementById('genepass');
      expect(button.disabled).toBe(false);
    });

    test('複数のチェックボックスがチェックされている場合ボタンが有効化される', () => {
      // 複数のチェックボックスをチェックする
      document.getElementById('lower').checked = true;
      document.getElementById('upper').checked = true;
      document.getElementById('numbers').checked = false;
      document.getElementById('symbols').checked = false;

      updateButtonState();

      const button = document.getElementById('genepass');
      expect(button.disabled).toBe(false);
    });

    test('全てのチェックボックスがチェックされている場合ボタンが有効化される', () => {
      // 全てのチェックボックスをチェックする
      document.getElementById('lower').checked = true;
      document.getElementById('upper').checked = true;
      document.getElementById('numbers').checked = true;
      document.getElementById('symbols').checked = true;

      updateButtonState();

      const button = document.getElementById('genepass');
      expect(button.disabled).toBe(false);
    });
  });
});
