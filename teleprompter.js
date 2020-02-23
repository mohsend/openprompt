// page elements
var $prompter = $('.prompter');
var $arrow = $('.arrow');
var $flipButton = $('.flip');
var $editButton = $('.edit');
var $helpButton = $('.help');
var $toolbar = $('.toolbar');
var $toolbar_right = $('.toolbar-right');
var $speedIndicator = $('.speed');

// teleprompter properties
var isPlaying = false;
var isFlipped = false;
var isBeingEdited = false;
var baseFontSize = $prompter.css('font-size');
var editFontSize = 50;
var speed = 0;
var startSpeed = 2;
var savedSpeed = 0;
var baseTime = 40;
var pageJump = 600;
var sensitivity = 1.5;

// Functions
function stop() {
  savedSpeed = speed;
  speed = 0;
  isPlaying = false;
  $('body').removeClass('playing');
  updateSpeed();
  if ( isBeingEdited ) {
    return;
  }
}

function play() {
  if ( isBeingEdited ) {
    return;
  }
  if ( ! isPlaying ) {
    //launchFullscreen();
    speed = savedSpeed || startSpeed;
    isPlaying = true;
    $('body').addClass('playing');
    updateSpeed();
    pageScroll();
  }
}

function updateSpeed() {
  if ( speed < -20 ) {
    speed = -20;
  } else if ( speed > 20 ) {
    speed = 20;
  }

  $speedIndicator.text(speed);
  if (speed > 0) {
    $speedIndicator.addClass('running')
  } else {
    $speedIndicator.removeClass('running');
  }
}


function pageScroll() {
  var direction;
  if ( speed < 0 ) {
    direction = -1;
  } else if ( speed > 0 ) {
    direction = 1;
  }
  window.scrollBy(0, direction);
  if ( $(document).scrollTop() === 0 && speed < 0) {
    speed = 0;
    stop();
  }
  if ( $(window).scrollTop() + $(window).height() === $(document).height()  && speed >= 0) {
    speed = 0;
    stop();
  };
  if (isPlaying) {
    scrolldelay = setTimeout('pageScroll()', baseTime / Math.abs(speed/sensitivity));
  }
}


function toggleMirror(evt) {
  $(this).add($prompter).add($toolbar).add($toolbar_right).add($editButton).add($helpButton).toggleClass('mirror');
  isFlipped = ! isFlipped;
  evt.stopPropagation();
}


/* bind keyboard events */

/* stop keys from working normally
   for example, make sure space doesn't jump down the page
   and down arrow doesn't affect scrolling.
   But, if in edit mode let keys work normally so you can type
 */
$(document).on('keydown', function(e) {
  if (! isBeingEdited) {
    e.preventDefault();
    updateSpeed();
  }
});

// start and stop with the space key
$(document).on('keydown',null,'space', function(e) {
  if (! isPlaying) {
      play();
    } else {
      stop();
    }
});

// up arrow: slow down (reverse)
$(document).on('keydown',null,'up', function(e) {
  speed -= 1;
  play();
});

// shift+up arrow : scroll up a bunch
$(document).on('keydown',null,'shift+up', function(e) {
  window.scrollBy(0, - pageJump);
});

// down arrow: speedup scroll down
$(document).on('keydown',null,'down', function(e) {
  speed += 1;
  play();
});

// shift+down arrow: scroll down a bunch
$(document).on('keydown',null,'shift+down', function(e) {
  window.scrollBy(0, pageJump);
});

// left arrow: jump to top
$(document).on('keydown',null,'left', function(e) {
  $(window).scrollTop(0);
    if (speed < 0) {
      speed = 0;
    }
});

// right arrow: jump to bottom
$(document).on('keydown',null,'right', function(e) {
  $('html,body').scrollTop( $(document).height() );
});

// increase font size
$(document).on('keydown',null,'shift+=', function(e) {
  setFontSize('+=5');
});

// decrease font size
$(document).on('keydown',null,'shift+-', function(e) {
  setFontSize('-=5');
});

// reset font size to default
$(document).on('keydown',null,'shift+0', function(e) {
  setFontSize(baseFontSize);
});

// toggles right-to-left/left-to-right direction.
$(document).on('keydown',null,'shift+d', function(e) {
  ($prompter).add($toolbar).add($toolbar_right).add($editButton).add($helpButton).toggleClass('rtl');
});

// toggle page flip (Mirror)
$(document).on('keydown',null,'shift+b', function(e) {
  toggleMirror(e);
});

// toggle page flip (Mirror) when clicking the flip button
$flipButton.click(function(e) {
	toggleMirror(e);
});

/* toggle full screen when clicking the page
   but only if you're not editing and the
   teleprompter isn't playing
*/
$('body').click(function() {
  if ( ! isBeingEdited && ! isPlaying) {
   toggleFullScreen();
  }
});

/* make arrow draggable along the side
   thanks jQuery UI
*/
$arrow.draggable({ axis: "y" });

// prompter properties
function setFontSize( amt ) {
  $prompter.css('font-size', amt);
}

// make page editable
$editButton.click(function (evt) {
  stop();
  evt.stopPropagation();
  isBeingEdited = ! isBeingEdited;
  if (isBeingEdited) {
    currentFontSize = $prompter.css('font-size');
    isPlaying = false;
    setFontSize(50);
    $prompter.prop('contentEditable',true).selectText();
    $('body').addClass('editing');
    $(this).text('Done');
  } else {
    setFontSize(baseFontSize);
    $prompter.prop('contentEditable',false);
    $('body').removeClass('editing');
    $(this).text('Edit');
  }
});

// Toggle help
$helpButton.click(function (evt) {
  stop();
  evt.stopPropagation();
  $('#helpContent').toggleClass('hidden');
});
