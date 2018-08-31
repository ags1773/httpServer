mainPgm();

function mainPgm(){
  window.square = document.querySelectorAll('.square');                             
  window.colorMegaArray = [];                            
  window.minDistance = 50;                            //'minDistance' sets the minimum distance between two RGB colors 
  window.answer;

  document.querySelector('h2').style.backgroundColor = 'steelblue';
  document.querySelector('#gameReset').textContent = 'New Colors';
  document.querySelector('#message').textContent = '';
  console.log('Distance = ' + minDistance);
  do{                                                 //Do While loop for getting rid of similar colors
    for(var i=0; i<square.length; i++){
      colorMegaArray[i] = randomColorGenerator();
    }
  } while(colorIsTooClose(colorMegaArray,minDistance));
  applyColor(colorMegaArray);
  answer = 'rgb(' + colorMegaArray[Math.floor(Math.random() * (square.length + 1))].join(', ') + ')';
  document.querySelector('#RGB').textContent = answer;
  for(var i=0; i<square.length; i++){
    square[i].addEventListener('click', function(){
      if(answer === this.style.backgroundColor){
        document.querySelector('#message').textContent = 'Correct!';
        document.querySelector('#gameReset').textContent = 'Play Again?';
        changeColor(answer);
      }
      else{
        this.style.backgroundColor = '#232323';
        this.style.border = '1px solid #232323';
        document.querySelector('#message').textContent = 'Wrong! Try again..';
      }
    });
  }
}

function insertSquares(n){
  for(var i=0; i<n; i++){
    var newSquare = document.createElement('div');
    newSquare.className = 'square';
    document.querySelector('#mainContainer').appendChild(newSquare);
  }
}

function removeSquares(){
  var unnecessarySquare = document.querySelectorAll('.square');
  for(var i=0; i<unnecessarySquare.length; i++){
    document.querySelector('#mainContainer').removeChild(unnecessarySquare[i]);
  }
}

function randomColorGenerator() {                   //Returns a 3-element array of random numbers, where each number is between 0 & 255
  var color = [];
  for(var i=0; i<3; i++){
    color[i] = Math.floor(Math.random() * (256));
  } 
  return color;
}

function colorIsTooClose(megaArray, distance){
  for(var i=0; i<megaArray.length-1; i++){
    for(var j=megaArray.length-1; j>i; j--){
      if(isTooClose(megaArray[i],megaArray[j],distance)){
        console.log('Too Close!');
        return true;
      }
      else{
        continue;
      }
    }
  }
  console.log('Colors are distinguishable...');
  return false;
}

function isTooClose(array1,array2,n){
  var flag = 0;

  for (var i=0; i<3; i++){
    if(Math.abs(array1[i]-array2[i]) < n){
      flag++;
    }
  }
  if(flag === 3){
    return true;
  }
  else{
    return false;
  } 
}

function applyColor(megaArray){
  for(var i=0; i<megaArray.length; i++){
    square[i].style.backgroundColor = 'rgb(' + megaArray[i][0] + ',' + megaArray[i][1] + ',' + megaArray[i][2] + ')';
    square[i].style.border = '1px solid white';
  }
}

function changeColor(color){
  for(var i=0; i<square.length; i++){
    square[i].style.backgroundColor = color;
    square[i].style.border = '1px solid white';
  }
  document.querySelector('h2').style.backgroundColor = color;
}

document.querySelector('#easy').onclick = function(){
  if(document.querySelector('#easy').className === ''){
    removeSquares();
    document.querySelector('#hard').classList.remove('selected');
    document.querySelector('#easy').classList.add('selected');
    insertSquares(3);
    mainPgm();
  }
}

document.querySelector('#hard').onclick = function(){
  if(document.querySelector('#hard').className === ''){
    removeSquares();
    document.querySelector('#easy').classList.remove('selected');
    document.querySelector('#hard').classList.add('selected');
    insertSquares(6);
    mainPgm();
  }
}

document.querySelector('#gameReset').onclick = function(){
  mainPgm();
}