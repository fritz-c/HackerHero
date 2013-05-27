// Count used to increment out_window div id's
var outWindowCount = 1;

// Text typer constructor
function TextTyper() {
  // Gets command string object to be put in window
  this.myCommand = new CommandString(COMMANDS_ARRAY);
}

// Initializes the event handler to handle key input
TextTyper.prototype.initKeyHandler = function()
{
  var tempThis = this;
  document.onkeydown = function(event) {
    var key_code = event.keyCode;

    // If enter is pressed with a non-blank command line,
    //  create a new window and flood the old one
    if (key_code == 13 &&
      tempThis.outWindow.children("span").html().length - tempThis.outWindow.children("span").children("span")[0].outerHTML.length > 2)
    {
      // Add return after command line
      tempThis.outWindow.children("span").children("span").before("<br/>");

      // Prepare command string for new out window
      tempThis.myCommand = new CommandString(COMMANDS_ARRAY);

      // Prepare text flood and send
      var flood = new TextFlood();
      flood.sendFlood(tempThis.outWindow);

      // Increment ID count
      outWindowCount++;

      // Create new out window
      tempThis.createNewDiv();
    }
    // If almost any key (save for enter, backspace, and some function keys) is pressed, command
    //  text will be output to the outWindow
    else if (key_code == 32 || key_code >= 48 && key_code <= 90 || key_code >= 94)
    {
      tempThis.outWindow.attr('contentEditable',false);
      tempThis.outWindow.children("span").children("span").before(tempThis.myCommand.getTypedPart());
    }
  };
};

TextTyper.prototype.initPromptBlink = function()
{
  var tempThis = this;
  var originalTarget = tempThis.outWindow;
  var willShow = false;
  var blinkInterval = setInterval(function() {
    if (willShow)
    {
      originalTarget.children("span").children("span").show();
    } else
    {
      originalTarget.children("span").children("span").hide();
    }
    willShow = !willShow;
    if(originalTarget != tempThis.outWindow && willShow) clearInterval(blinkInterval);
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

  $('body').append("<div id='" + OUT_WINDOW_PREFIX + outWindowCount +
    "' class='outWindow' onMouseDown='contentEditable=true' style='top:" + tempWindowPositionTop +
    "px; left:" + tempWindowPositionLeft + "px;'><span class='windowText'>$ <span>_</span></span></div>");
  tempThis.outWindow = $("#" + OUT_WINDOW_PREFIX + outWindowCount);
  tempThis.initPromptBlink();
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
      targetElement.children("span").children("span").before(outString);
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
