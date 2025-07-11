function generatePassword() {
  const passLength = document.getElementById('passlen').value;
  const lowerLetter = document.getElementById('lower').checked;
  const upperLetter = document.getElementById('upper').checked;
  const numLetter = document.getElementById('numbers').checked;
  const symLetter = document.getElementById('symbols').checked;

  const characterSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!"£$%&/()=?^\'*+-_.:,;.:'
  };

  let availableChars = '';

  if (lowerLetter) availableChars += characterSets.lowercase;
  if (upperLetter) availableChars += characterSets.uppercase;
  if (numLetter) availableChars += characterSets.numbers;
  if (symLetter) availableChars += characterSets.symbols;

  let password = '';
  for (let i = 0; i < passLength; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    password += availableChars[randomIndex];
  }

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
}

const generateButton = document.getElementById('genepass');
generateButton.addEventListener('click', generatePassword);