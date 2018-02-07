/*
 * Original detector.js by:
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/

 * Simplified version by:
 * @author FergK / http://fergk.com/
 * with local storage code from http://diveintohtml5.info/storage.html
 */
 

var Detector = {

	webgl: (
		function () {
			try { 
				var canvas = document.createElement( 'canvas' );
				return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
			} catch ( e ) { 
				return false;
			}
		}
	)(),
	
	localStorage: ( 
		function () {
  		try {
    		return 'localStorage' in window && window['localStorage'] !== null;
  		} catch (e) {
    		return false;
		  }
		}
	)(),
	
	imports: ( 
		function () {
  		return 'import' in document.createElement('link');
		}
	)(),

	updateDetectorMessage: function ( errorID, startID ) {

		var errorMessage = document.getElementById(errorID);
		var startButton = document.getElementById(startID);
		
		if ( this.webgl ) {
		  errorMessage.parentNode.removeChild(errorMessage);
		  startButton.style.display = "inline-block";
		} else {
		  errorMessage.innerHTML = errorMessage.innerHTML + "<hr><span class=\"error\">Sorry! It looks like your browser doesn't support WebGL :(</span><br><a href=\"http://caniuse.com/#feat=webgl\">Here's a list of browsers that might work.</a>";
		}

	}

};

// console.log( Detector );
// console.log( "WebGL Support: " + Detector.webgl );
// console.log( "Local Storage Support: " + Detector.localStorage );