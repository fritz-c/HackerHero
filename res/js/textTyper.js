// var COMMANDS_FILENAME = "terminal_commands.txt";

var outWindowCount = 1;

function TextTyper() {
  this.myCommand = new CommandString(COMMANDS_ARRAY);
}

TextTyper.prototype.initKeyHandler = function()
{
  var tempThis = this;
  document.onkeydown = function(event) {
    var key_code = event.keyCode;
    if (key_code == 13 && tempThis.outWindow.children("span").html().length > 3)
    {
      tempThis.myCommand = new CommandString(COMMANDS_ARRAY);
      var flood = new TextFlood();
      flood.sendFlood(tempThis.outWindow);
      outWindowCount++;
      tempThis.createNewDiv();
    }
    else if (key_code == 32 || key_code >= 48 && key_code <= 90 || key_code >= 94)
    {
      tempThis.outWindow.children("span").append(tempThis.myCommand.getTypedPart());
    }
  };
};

TextTyper.prototype.initPromptBlink = function()
{
  var tempThis = this;
  var originalTarget = tempThis.outWindow;
  var willAppend = true;
  var blinkInterval = setInterval(function() {
    if (willAppend)
    {
      originalTarget.children("span").append("_");
    } else
    {
      originalTarget.children("span").append("_");
    }
    if(originalTarget != tempThis.outWindow && willAppend) clearInterval(blinkInterval);
  }, PROMPT_BLINK_INTERVAL);
};

// console.log(COMMANDS_ARRAY);

TextTyper.prototype.createNewDiv = function()
{
  var tempThis = this;
  var windowFake = $("<div class='outWindow'></div>").hide().appendTo("body");
  var windowWidth = windowFake.outerWidth();
  var windowHeight = windowFake.outerHeight();
  windowFake.remove();
  var pageWidth = $(window).width();
  var pageHeight = $(window).height();
  var tempWindowPositionLeft = 0;
  var tempWindowPositionTop = 0;

  if (outWindowCount == 1)
  {
    tempWindowPositionLeft = (pageWidth - windowWidth) / 2;
    tempWindowPositionTop = (pageHeight - windowHeight) / 2;
  }
  else
  {
    tempWindowPositionLeft = Math.floor(Math.random() * (pageWidth - windowWidth));
    tempWindowPositionTop = Math.floor(Math.random() * (pageHeight - windowHeight));
  }

  // this.outWindow = $();
  $('body').append("<div id='" + OUT_WINDOW_PREFIX + outWindowCount +
    "' class='outWindow' style='top:" + tempWindowPositionTop +
    "px; left:" + tempWindowPositionLeft + "px;'><span class='windowText'>$ </span></div>");
  tempThis.outWindow = $("#" + OUT_WINDOW_PREFIX + outWindowCount);
};

function CommandString(commands_array) {
  this.command = commands_array[Math.floor(Math.random()*commands_array.length)];
  this.headPosition = 0;
}

CommandString.prototype.getTypedPart = function()
{
  var nextHead = Math.min(this.headPosition + CHARACTER_JUMP_LENGTH, this.command.length);
  var outString = this.command.substring(this.headPosition, nextHead);
  this.headPosition = nextHead;
  return removeTags(outString);
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
  targetElement.children("span").append("<br/>");
  var interval = setInterval(function() {
      var nextHead = Math.min(headPosition + tempThis.floodJumpLength, tempThis.text.length);
      var outString = tempThis.text.substring(headPosition, nextHead);
      headPosition = nextHead;
      targetElement.children("span").append(outString);
      if(headPosition >= tempThis.text.length) clearInterval(interval);
  }, FLOOD_SLEEP_TIME);
};

// define the WhiteOnBlackTerminal class
function WhiteOnBlackTerminal() {
  // Call the parent constructor
  TextTyper.call(this);
}

// inherit TextTyper
WhiteOnBlackTerminal.prototype = (function() {
  var Base = function() {};
  Base.prototype = TextTyper.prototype;
  return new Base();
}());
// new TextTyper();

// correct the constructor pointer because it points to TextTyper
WhiteOnBlackTerminal.prototype.constructor = WhiteOnBlackTerminal;

$(function() {
  // $('body').append("<div id='" + OUT_WINDOW_PREFIX + outWindowCount + "' class='outWindow'><span class='windowText'>$ </span></div>");
  var whiteOnBlackTerminal1 = new WhiteOnBlackTerminal();
  whiteOnBlackTerminal1.createNewDiv();
  whiteOnBlackTerminal1.initKeyHandler();
});
