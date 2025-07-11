function generatePassword() {

  var lunPass = document.querySelector('#passlen').value;
  var lowerLetter = document.querySelector('#lower').checked;
  var upperLetter = document.querySelector('#upper').checked;
  var numLetter = document.querySelector('#numbers').checked;
  var symLetter = document.querySelector('#symbols').checked;

  var el = [];
  var numberOfCharacters = 0;

  if(lowerLetter) {
    el.push('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z');
    numberOfCharacters = 26;
  }
  if(upperLetter) {
    el.push('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    numberOfCharacters = numberOfCharacters + 26;
  }
  if(numLetter) {
    el.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
    numberOfCharacters = numberOfCharacters + 10;
  }
  if(symLetter) {
    el.push('!', '\"', '£', '$', '%', '&', '/', '(', ')', '=', '?', '^', '\'', '*', '+', '-', '_', '.', ':', ',', ';', '.', ':');
    numberOfCharacters = numberOfCharacters + 23;
  }

  var password = '';

  for(var i = 0; i < lunPass; i++) {
    var randomNumber = Math.floor(Math.random() * numberOfCharacters);
    password += el[randomNumber];
  }

  var pasText = document.querySelector('#pasText');
  pasText.value = password;
  pasText.className = 'show';

  navigator.clipboard.writeText(password).then(function() {
    var copied = document.querySelector('#copied');
    copied.style.display = 'block';
    setTimeout(function() {
      copied.style.display = 'none';
    }, 2000);
  }).catch(function(err) {
    console.error('Failed to copy password: ', err);
  });
}

var el = document.querySelector('#genepass');
el.addEventListener('click', generatePassword, false);