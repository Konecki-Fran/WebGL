
class InputHandler {
	constructor(element) {
		element.addEventListener("click", function(event) {
			g_isPaused = !g_isPaused;
		});	

		element.addEventListener("keydown", (event) => {
		  if (event.defaultPrevented) {
		    return; // Do nothing if the event was already processed
		  }

		  switch (event.key) {
		    case "ArrowDown":
		      // Do something for "down arrow" key press.
		      break;
		    case "ArrowUp":
		      // Do something for "up arrow" key press.
		      break;
		    case "ArrowLeft":
		      // Do something for "left arrow" key press.
		      break;
		    case "ArrowRight":
		      // Do something for "right arrow" key press.
		      break;
		    case "Enter":
		      // Do something for "enter" or "return" key press.
		      break;
		    case " ":
		      // Do something for "space" key press.
		      break;
		    case "Escape":
		      // Do something for "esc" key press.
		      break;
		    default:
		      return; // Quit when this doesn't handle the key event.
		  }

		  // Cancel the default action to avoid it being handled twice
		  event.preventDefault();
		});
	}
}