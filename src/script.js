const characterSets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!"£$%&/()=?^\'*+-_.:,;.:'
};

function createPassword(length, options) {
  let availableChars = '';

  if (options.lowercase) availableChars += characterSets.lowercase;
  if (options.uppercase) availableChars += characterSets.uppercase;
  if (options.numbers) availableChars += characterSets.numbers;
  if (options.symbols) availableChars += characterSets.symbols;

  if (availableChars === '') {
    throw new Error('At least one character type must be selected');
  }

  if (length < 1 || length > 30) {
    throw new Error('Password length must be between 1 and 30');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    password += availableChars[randomIndex];
  }

  return password;
}

function generatePassword() {
  const passLength = parseInt(document.getElementById('passlen').value);
  const options = {
    lowercase: document.getElementById('lower').checked,
    uppercase: document.getElementById('upper').checked,
    numbers: document.getElementById('numbers').checked,
    symbols: document.getElementById('symbols').checked
  };

  try {
    const password = createPassword(passLength, options);

    const pasText = document.getElementById('pasText');
    pasText.value = password;
    pasText.className = 'show';

    navigator.clipboard.writeText(password)
      .then(() => {
        const copied = document.getElementById('copied');
        copied.style.display = 'block';
        setTimeout(() => {
          copied.style.display = 'none';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy password:', err);
      });
  } catch (error) {
    console.error('Password generation failed:', error.message);
  }
}

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

if (typeof document !== 'undefined') {
  const generateButton = document.getElementById('genepass');
  generateButton.addEventListener('click', generatePassword);

  // チェックボックスの変更を監視
  const checkboxes = ['lower', 'upper', 'numbers', 'symbols'];
  checkboxes.forEach(id => {
    document.getElementById(id).addEventListener('change', updateButtonState);
  });

  // 初期状態をチェック
  updateButtonState();
}