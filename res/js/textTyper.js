// Count used to increment out_window div id's
window.outWindowCount = 1;
window.mute_all = false;


//////////////////////////////////////////////////////////////////////
//                          OUT WINDOW
// Represents a window to be displayed on the page
//////////////////////////////////////////////////////////////////////

// OutWindow constructor
function OutWindow() {
  this.cssClass = null;
  this.x = 0;
  this.y = 0;
  this.jqObject = null;
  this.id = OUT_WINDOW_PREFIX + outWindowCount;
  outWindowCount++;
}

OutWindow.prototype.init = function(cssClass)
{
  this.cssClass = cssClass;
  this.jqObject = $("<div></div>")
                  .attr("id", this.id)
                  .addClass(this.cssClass);
};

OutWindow.prototype.draw = function(x, y)
{
  if(this.exists()) this.erase();
  this.x = x;
  this.y = y;
  $('body').append(this.jqObject
                  .css("top", this.y + "px")
                  .css("left", this.x + "px"));
};

OutWindow.prototype.erase = function()
{
  $('#' + this.id).remove();
};

OutWindow.prototype.exists = function()
{
  return $("#" + this.id).length;
};

OutWindow.prototype.getWidth = function()
{
  var windowFake = $("<div></div>").addClass(this.cssClass).hide().appendTo("body");
  var windowWidth = windowFake.outerWidth();
  windowFake.remove();
  return windowWidth;
};

OutWindow.prototype.getHeight = function()
{
  var windowFake = $("<div></div>").addClass(this.cssClass).hide().appendTo("body");
  var windowHeight = windowFake.outerHeight();
  windowFake.remove();
  return windowHeight;
};

OutWindow.prototype.getWindow = function()
{
  return $("#" + this.id);
};

  // .mousedown(function(){
  //   $(this).attr("contentEditable","true");
  // })


//////////////////////////////////////////////////////////////////////
//                        COMMAND WINDOW
// Represents a terminal window.   (extends OutWindow)
//////////////////////////////////////////////////////////////////////

// define the CommandWindow class
function CommandWindow() {
  // Call the parent constructor
  OutWindow.call(this);

  // Gets command string object to be put in window
  this.myCommand = new CommandString(COMMANDS_ARRAY);

  this.isBlinking = false;
}

// inherit OutWindow
CommandWindow.prototype = (function() {
  var Base = function() {};
  Base.prototype = OutWindow.prototype;
  return new Base();
}());

// correct the constructor pointer because it points to OutWindow
CommandWindow.prototype.constructor = CommandWindow;

CommandWindow.prototype.init = function()
{
  OutWindow.prototype.init.call(this, "commandWindow");
  this.jqObject = this.jqObject
    .mousedown(function(){
      $(this).attr("contentEditable","true");
    })
    .append(
      $("<span></span>")
      .addClass("commandText")
      .text("$ ")
      .append(
        $("<span></span>")
        .text("_")
      )
    );
  this.initPromptBlink();
};

CommandWindow.prototype.initPromptBlink = function()
{
  var tempThis = this;
  var originalTarget = this.jqObject;
  tempThis.isBlinking = true;
  var willShow = false;
  var blinkInterval = setInterval(function() {
    if (willShow)
    {
      originalTarget.find("span").last().show();
    } else
    {
      originalTarget.find("span").last().hide();
    }
    willShow = !willShow;
    if(!tempThis.isBlinking && willShow) clearInterval(blinkInterval);
  }, PROMPT_BLINK_INTERVAL);
};

CommandWindow.prototype.draw = function(x, y)
{
  OutWindow.prototype.draw.call(this, x, y);
  this.initPromptBlink();
  this.initKeyHandler();
};

// handle key input (assign to document?)

// Initializes the event handler to handle key input
CommandWindow.prototype.initKeyHandler = function()
{
  var tempThis = this;
  document.onkeydown = function(event) {
    var key_code = event.keyCode;

    // If enter is pressed with a non-blank command line,
    //  create a new window and flood the old one
    if (key_code == 13 &&
      tempThis.jqObject.children("span").html().length -
      tempThis.jqObject.children("span").children("span")[0].outerHTML.length > 2)
    {
      tempThis.jqObject.attr('contentEditable',false);
      tempThis.isBlinking = false;

      // Prepare text flood and send
      var flood = new TextFlood();
      flood.sendFlood(tempThis.jqObject.find("span").first());

      // Create new out window
      generateWindow();
    }
    // If almost any key (save for enter, backspace, and some function keys) is pressed, command
    //  text will be output to the jqObject
    else if (key_code == 32 || key_code >= 48 && key_code <= 90 || key_code >= 94)
    {
      tempThis.jqObject.attr('contentEditable',false);
      tempThis.myCommand.sendTypedPart(tempThis.jqObject.find("span").last());
      // tempThis.jqObject.find("span").last().before(tempThis.myCommand.getTypedPart());
    // Catch backspace
    } else if (key_code == 8)
    {
      return false;
    }
  };
};

function CommandString(commands_array) {
  this.command = commands_array[Math.floor(Math.random()*commands_array.length)];
  this.headPosition = 0;
}

CommandString.prototype.sendTypedPart = function(targetElement)
{
  var nextHead = Math.min(this.headPosition + CHARACTER_JUMP_LENGTH, this.command.length);
  var outString = this.command.substring(this.headPosition, nextHead);
  this.headPosition = nextHead;
  // return removeTags(outString);
  targetElement.before(removeTags(outString));
};

function TextFlood() {
  var randomIndex = Math.floor(Math.random()*FLOOD_TEXT.length);
  this.text = FLOOD_TEXT[randomIndex];
  this.floodJumpLength = FLOOD_JUMP_LENGTH[randomIndex];
  if (this.floodJumpLength < 0)
  {
    this.floodJumpLength =  Math.floor(Math.random() * 30 + 10);
  }
  // this.targetElement = targetElement;
}

TextFlood.prototype.sendFlood = function(targetElement)
{
  var tempThis = this;
  var headPosition = 0;
  targetElement.append("<br/>");
  var interval = setInterval(function() {
      var nextHead = Math.min(headPosition + tempThis.floodJumpLength, tempThis.text.length);
      var outString = tempThis.text.substring(headPosition, nextHead);
      headPosition = nextHead;
      targetElement.append(outString);
      if(headPosition >= tempThis.text.length) clearInterval(interval);
  }, FLOOD_SLEEP_TIME);
};

// // correct the constructor pointer because it points to CommandWindow
// WhiteOnBlackTerminal.prototype.constructor = WhiteOnBlackTerminal;

//////////////////////////////////////////////////////////////////////
//                        DISPLAY WINDOW
// Represents a window to display text or images.  (extends OutWindow)
//////////////////////////////////////////////////////////////////////

// define the DisplayWindow class
function DisplayWindow() {
  // Call the parent constructor
  OutWindow.call(this);
}

// inherit OutWindow
DisplayWindow.prototype = (function() {
  var Base = function() {};
  Base.prototype = OutWindow.prototype;
  return new Base();
}());

// correct the constructor pointer because it points to OutWindow
DisplayWindow.prototype.constructor = DisplayWindow;

DisplayWindow.prototype.initWithHtmlAndClass = function(inHtml, cssClass)
{
  OutWindow.prototype.init.call(this, cssClass);
  this.jqObject = this.jqObject
    .html($("<span></span>")
      .addClass("centerText")
      .html(inHtml));
};

DisplayWindow.prototype.draw = function(x, y)
{
  OutWindow.prototype.draw.call(this, x, y);
  this.initKeyHandler();
};

// Initializes the event handler to handle key input
DisplayWindow.prototype.initKeyHandler = function()
{
  var tempThis = this;
  document.onkeydown = function(event) {
    var key_code = event.keyCode;
    // If enter is pressed with a non-blank command line,
    //  create a new window and flood the old one
    if (key_code == 13)
    {
      // Create new out window
      // generateWindow();
      return false;
    }
    // If almost any key (save for enter, backspace, and some function keys) is pressed, command
    //  text will be output to the jqObject
    else if (key_code == 32 || key_code >= 48 && key_code <= 90 || key_code >= 94)
    {
      // tempThis.jqObject.attr('contentEditable',false);
      // tempThis.myCommand.sendTypedPart(tempThis.jqObject.find("span").last());
      // tempThis.jqObject.find("span").last().before(tempThis.myCommand.getTypedPart());
    // Catch backspace
    } else if (key_code == 8){ return false; }
  };
};

function removeTags(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '&lt;');
}

function generateWindow() {
  var pageWidth = $(window).width();
  var pageHeight = $(window).height();
  var myOutWindow;
  switch(outWindowCount)
  {
  case 1:
    myOutWindow = new CommandWindow();
    myOutWindow.init();
    myOutWindow.draw(
      (pageWidth - myOutWindow.getWidth()) / 2,
      (pageHeight - myOutWindow.getHeight()) / 2
      );
    break;
  case 2:
  case 3:
  case 4:
  case 5:
    myOutWindow = new CommandWindow();
    myOutWindow.init();
    myOutWindow.draw(
      Math.floor(Math.random() * (pageWidth - myOutWindow.getWidth())),
      Math.floor(Math.random() * (pageHeight - myOutWindow.getHeight()))
      );
    break;
  case 6:
    myOutWindow = new DisplayWindow();
    if(Math.random(2) < 0.5)
    {
      myOutWindow.initWithHtmlAndClass("ACCESS<br/>GRANTED", "accessGranted");
    } else {
      playSound(EVIL_LAUGH_SOUND);
      myOutWindow.initWithHtmlAndClass("NO GO<br/><img src='res/img/skull.gif'>", "accessDenied");
    }
    myOutWindow.draw(
    (pageWidth - myOutWindow.getWidth()) / 2,
    (pageHeight - myOutWindow.getHeight()) / 2
    );
    tempWindowClassName = "accessGranted";
    // execute code block 2
    break;
  default:
    // code to be executed if n is different from case 1 and 2
  }
}

function playSound(sound) {
  if (!window.mute_all)
    sound.start(0);
}

$(function() {
  $('#mute_button').bind('click', function(){
    if ($(this).hasClass('muteButtonUnmuted')) {
      $(this).removeClass('muteButtonUnmuted').addClass('muteButtonMuted');
    } else if ($(this).hasClass('muteButtonMuted')) {
      $(this).removeClass('muteButtonMuted').addClass('muteButtonUnmuted');
    } else {
      $(this).addClass('muteButtonUnmuted');
    }
    mute_all = !mute_all;
  });
  $('#bgm_button').bind('click', function(){
    if ($(this).hasClass('bgmButtonUnmuted')) {
      $(this).removeClass('bgmButtonUnmuted').addClass('bgmButtonMuted');
      BGM_SOUND.stop();

    } else if ($(this).hasClass('bgmButtonMuted')) {
      $(this).removeClass('bgmButtonMuted').addClass('bgmButtonUnmuted');
      BGM_SOUND.start(0);
    } else {
      $(this).addClass('bgmButtonUnmuted');
      BGM_SOUND.start(0);
    }
  });
  generateWindow();
});

// Newmann head ah-ah-ah
// Access granted
// fbi seal






  //     window.rikaichan = {};
  //     window.addEventListener('mousemove', this.onMouseMove, false);
  //     window.addEventListener('keydown', this.onKeyDown, true);
  //     window.addEventListener('keyup', this.onKeyUp, true);
  //     window.addEventListener('mousedown', this.onMouseDown, false);
  //     window.addEventListener('mouseup', this.onMouseUp, false);
  //   }
  // },

  // //Removes the listeners and stuff
  // disableTab: function() {
  //   if(window.rikaichan != null) {
  //     var e;
  //     window.removeEventListener('mousemove', this.onMouseMove, false);
  //     window.removeEventListener('keydown', this.onKeyDown, true);
  //     window.removeEventListener('keyup', this.onKeyUp, true);
  //     window.removeEventListener('mosuedown', this.onMouseDown, false);
  //     window.removeEventListener('mouseup', this.onMouseUp, false);