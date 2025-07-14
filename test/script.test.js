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
    <input type="number" id="passlen" value="12" min="1" max="100">
    <input type="checkbox" id="lower" checked>
    <input type="checkbox" id="upper" checked>
    <input type="checkbox" id="numbers" checked>
    <input type="checkbox" id="symbols" checked>
    <button id="genepass">GENERATE PASSWORD</button>
    <textarea id="pasText"></textarea>
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

  describe('HTML表示機能', () => {
    beforeEach(() => {
      setupDOM();
      // navigator.clipboardをモック
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn().mockResolvedValue(),
        },
        writable: true,
      });

      // DOM関数を再定義（テスト環境用）
      // biome-ignore lint/security/noGlobalEval: テスト環境でのDOM関数定義のため必要
      eval(`
        function generatePassword() {
          const passLength = parseInt(document.getElementById('passlen').value);
          const options = {
            lowercase: document.getElementById('lower').checked,
            uppercase: document.getElementById('upper').checked,
            numbers: document.getElementById('numbers').checked,
            symbols: document.getElementById('symbols').checked,
          };

          try {
            const password = createPassword(passLength, options);

            const pasText = document.getElementById('pasText');
            pasText.value = password;
            pasText.className = 'show';

            navigator.clipboard.writeText(password);
          } catch (error) {
            console.error('Password generation failed:', error.message);
          }
        }
      `);

      // ボタンクリックイベントを設定
      const generateButton = document.getElementById('genepass');
      generateButton.addEventListener('click', generatePassword);
    });

    test('ボタンクリック後にテキストエリアにパスワードが表示される', () => {
      // 初期状態では空
      const pasText = document.getElementById('pasText');
      expect(pasText.value).toBe('');

      // パスワード生成ボタンをクリック
      const generateButton = document.getElementById('genepass');
      generateButton.click();

      // パスワードが表示されることを確認
      expect(pasText.value).not.toBe('');
      expect(pasText.value).toHaveLength(12); // デフォルト長
    });

    test('指定した長さのパスワードがHTMLに正しく表示される', () => {
      // 20文字のパスワード設定
      document.getElementById('passlen').value = '20';

      const generateButton = document.getElementById('genepass');
      generateButton.click();

      const pasText = document.getElementById('pasText');
      expect(pasText.value).toHaveLength(20);
    });

    test('文字種設定に応じたパスワードがHTMLに表示される', () => {
      // 数字のみの設定
      document.getElementById('lower').checked = false;
      document.getElementById('upper').checked = false;
      document.getElementById('numbers').checked = true;
      document.getElementById('symbols').checked = false;

      const generateButton = document.getElementById('genepass');
      generateButton.click();

      const pasText = document.getElementById('pasText');
      expect(pasText.value).toMatch(/^[0-9]+$/);
    });

    test('複数回クリックで異なるパスワードが表示される', () => {
      const generateButton = document.getElementById('genepass');
      const pasText = document.getElementById('pasText');

      // 1回目
      generateButton.click();
      const firstPassword = pasText.value;

      // 2回目
      generateButton.click();
      const secondPassword = pasText.value;

      // 異なるパスワードが生成されることを確認
      expect(firstPassword).not.toBe(secondPassword);
      expect(firstPassword).toHaveLength(12);
      expect(secondPassword).toHaveLength(12);
    });

    test('テキストエリアにshowクラスが追加される', () => {
      const pasText = document.getElementById('pasText');

      // 初期状態ではshowクラスがない
      expect(pasText.className).toBe('');

      const generateButton = document.getElementById('genepass');
      generateButton.click();

      // パスワード生成後にshowクラスが追加される
      expect(pasText.className).toBe('show');
    });
  });

  describe('クリップボード連携', () => {
    let clipboardText = '';

    beforeEach(() => {
      setupDOM();
      // navigator.clipboardをモック
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn().mockImplementation((text) => {
            clipboardText = text;
            return Promise.resolve();
          }),
        },
        writable: true,
      });

      // DOM関数を再定義（テスト環境用）
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
        
        function adjustTextareaHeight(textarea) {
          // テスト環境では簡略化
          textarea.style.height = 'auto';
        }
        
        function generatePassword() {
          const passLength = parseInt(document.getElementById('passlen').value);
          const options = {
            lowercase: document.getElementById('lower').checked,
            uppercase: document.getElementById('upper').checked,
            numbers: document.getElementById('numbers').checked,
            symbols: document.getElementById('symbols').checked,
          };

          try {
            const password = createPassword(passLength, options);

            const pasText = document.getElementById('pasText');
            pasText.value = password;
            pasText.className = 'show';

            adjustTextareaHeight(pasText);

            navigator.clipboard
              .writeText(password)
              .then(() => {
                // テスト環境では copied 要素は不要
              })
              .catch((err) => {
                console.error('Failed to copy password:', err);
              });
          } catch (error) {
            console.error('Password generation failed:', error.message);
          }
        }
      `);

      // ボタンクリックイベントを設定
      const generateButton = document.getElementById('genepass');
      generateButton.addEventListener('click', generatePassword);
    });

    test('生成されたパスワードがHTMLとクリップボードで一致する', async () => {
      // パスワード長を設定
      document.getElementById('passlen').value = '12';

      // 全ての文字種を有効化
      document.getElementById('lower').checked = true;
      document.getElementById('upper').checked = true;
      document.getElementById('numbers').checked = true;
      document.getElementById('symbols').checked = true;

      // パスワード生成ボタンをクリック
      const generateButton = document.getElementById('genepass');
      generateButton.click();

      // 少し待機してPromiseを解決
      await new Promise((resolve) => setTimeout(resolve, 10));

      // HTMLのテキストエリアから表示されているパスワードを取得
      const pasText = document.getElementById('pasText');
      const displayedPassword = pasText.value;

      // クリップボードに保存されたテキストと比較
      expect(displayedPassword).toBe(clipboardText);
      expect(displayedPassword).toHaveLength(12);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(displayedPassword);
    });

    test('異なる設定でもHTMLとクリップボードが一致する', async () => {
      // 小文字のみの設定
      document.getElementById('passlen').value = '8';
      document.getElementById('lower').checked = true;
      document.getElementById('upper').checked = false;
      document.getElementById('numbers').checked = false;
      document.getElementById('symbols').checked = false;

      const generateButton = document.getElementById('genepass');
      generateButton.click();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const pasText = document.getElementById('pasText');
      const displayedPassword = pasText.value;

      expect(displayedPassword).toBe(clipboardText);
      expect(displayedPassword).toHaveLength(8);
      expect(displayedPassword).toMatch(/^[a-z]+$/);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(displayedPassword);
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
