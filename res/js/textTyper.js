// Count used to increment out_window div id's
var outWindowCount = 1;

// OutWindow constructor
function OutWindow() {
  this.cssClass = null;
}

// Text typer constructor
function CommandWindow() {
  // Gets command string object to be put in window
  this.myCommand = new CommandString(COMMANDS_ARRAY);
}

// create the div
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
      tempThis.myWindow.children("span").html().length - tempThis.myWindow.children("span").children("span")[0].outerHTML.length > 2)
    {
      tempThis.myWindow.attr('contentEditable',false);
      // Add return after command line
      tempThis.myWindow.children("span").children("span").before("<br/>");

      // Prepare command string for new out window
      tempThis.myCommand = new CommandString(COMMANDS_ARRAY);

      // Prepare text flood and send
      var flood = new TextFlood();
      flood.sendFlood(tempThis.myWindow);

      // Increment ID count
      outWindowCount++;

      // Create new out window
      tempThis.createNewDiv();
    }
    // If almost any key (save for enter, backspace, and some function keys) is pressed, command
    //  text will be output to the myWindow
    else if ((key_code == 32 || key_code >= 48 && key_code <= 90 || key_code >= 94) && outWindowCount < ACCESS_GRANTED_APPEARANCE)
    {
      tempThis.myWindow.attr('contentEditable',false);
      tempThis.myWindow.children("span").children("span").before(tempThis.myCommand.getTypedPart());
    // Catch backspace
    } else if (key_code == 8)
    {
      return false;
    }
  };
};

CommandWindow.prototype.initPromptBlink = function()
{
  var tempThis = this;
  var originalTarget = tempThis.myWindow;
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
    if(originalTarget != tempThis.myWindow && willShow) clearInterval(blinkInterval);
  }, PROMPT_BLINK_INTERVAL);
};

// console.log(COMMANDS_ARRAY);

CommandWindow.prototype.createNewDiv = function()
{
  var tempThis = this;
  var windowFake = $("<div></div>").addClass("commandWindow").hide().appendTo("body");
  var windowWidth = windowFake.outerWidth();
  var windowHeight = windowFake.outerHeight();
  windowFake.remove();
  var pageWidth = $(window).width();
  var pageHeight = $(window).height();
  var tempWindowPositionLeft = 0;
  var tempWindowPositionTop = 0;
  var tempWindowClassName = "";

  if (outWindowCount == 1)
  {
    tempWindowPositionLeft = (pageWidth - windowWidth) / 2;
    tempWindowPositionTop = (pageHeight - windowHeight) / 2;
    tempWindowClassName = "commandWindow";
  }
  else if (outWindowCount < ACCESS_GRANTED_APPEARANCE)
  {
    tempWindowPositionLeft = Math.floor(Math.random() * (pageWidth - windowWidth));
    tempWindowPositionTop = Math.floor(Math.random() * (pageHeight - windowHeight));
    tempWindowClassName = "commandWindow";
  } else {
    windowFake = $("<div></div>").addClass("accessGranted").hide().appendTo("body");
    windowWidth = windowFake.outerWidth();
    windowHeight = windowFake.outerHeight();
    windowFake.remove();
    tempWindowPositionLeft = (pageWidth - windowWidth) / 2;
    tempWindowPositionTop = (pageHeight - windowHeight) / 2;
    tempWindowClassName = "accessGranted";
  }

  $('body').append(
    $("<div></div>")
    .attr("id", OUT_WINDOW_PREFIX + outWindowCount)
    .addClass(tempWindowClassName)
    .mousedown(function(){
      $(this).attr("contentEditable","true");
    })
    .css("top", tempWindowPositionTop + "px")
    .css("left", tempWindowPositionLeft + "px")
    .append(
      $("<span></span>")
      .addClass("commandText")
      .text("$ ")
      .append(
        $("<span></span>")
        .text("_")
      )
    )
  );

  tempThis.myWindow = $("#" + OUT_WINDOW_PREFIX + outWindowCount);
  if (outWindowCount >= ACCESS_GRANTED_APPEARANCE)
  {
    tempThis.myWindow.html($("<span></span>").addClass("accessMessage").html("ACCESS<br/>GRANTED"));
  }else{
    tempThis.initPromptBlink();
  }
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
  CommandWindow.call(this);
}

// inherit CommandWindow
WhiteOnBlackTerminal.prototype = (function() {
  var Base = function() {};
  Base.prototype = CommandWindow.prototype;
  return new Base();
}());
// new CommandWindow();

// correct the constructor pointer because it points to CommandWindow
WhiteOnBlackTerminal.prototype.constructor = WhiteOnBlackTerminal;

$(function() {
  // $('body').append("<div id='" + OUT_WINDOW_PREFIX + outWindowCount + "' class='commandWindow'><span class='windowText'>$ </span></div>");
  var whiteOnBlackTerminal1 = new WhiteOnBlackTerminal();
  whiteOnBlackTerminal1.createNewDiv();
  whiteOnBlackTerminal1.initKeyHandler();
});
