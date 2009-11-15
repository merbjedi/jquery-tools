/**
 * tools.expose 1.0.5 - Make HTML elements stand out
 * 
 * Copyright (c) 2009 Tero Piirainen
 * http://flowplayer.org/tools/expose.html
 *
 * Dual licensed under MIT and GPL 2+ licenses
 * http://www.opensource.org/licenses
 *
 * Launch  : June 2008
 * Date: ${date}
 * Revision: ${revision} 
 */
(function($) { 	

	// static constructs
	$.tools = $.tools || {};
	
	$.tools.expose = {
		version: '1.0.5',  
		conf: {	

			// mask settings
			maskId: null,
			loadSpeed: 'slow',
			closeSpeed: 'fast',
			closeOnClick: true,
			closeOnEsc: true,
			
			// css settings
			zIndex: 9998,
			opacity: 0.8,
			color: '#456',
			api: false
		}
	};

	/* one of the greatest headaches in the tool. finally made it */
	function viewport() {
				
		// the horror case
		if ($.browser.msie) {
			
			// if there are no scrollbars then use window.height
			var d = $(document).height(), w = $(window).height();
			
			return [
				window.innerWidth || 							// ie7+
				document.documentElement.clientWidth || 	// ie6  
				document.body.clientWidth, 					// ie6 quirks mode
				d - w < 20 ? w : d
			];
		} 
		
		// other well behaving browsers
		return [$(window).width(), $(document).height()];
		
	} 
	
	function Expose(els, conf) { 
		
		// private variables
		var self = this, $self = $(this), mask = null, loaded = false, origIndex = 0;		
		
		// bind all callbacks from configuration
		$.each(conf, function(name, fn) {
			if ($.isFunction(fn)) { $self.bind(name, fn); }
		});	 

		// adjust mask size when window is resized (or firebug is toggled)
		$(window).resize(function() {
			self.fit();
		}); 
		
		
		// public methods
		$.extend(this, {
		
			getMask: function() {
				return mask;	
			},
			
			getExposed: function() {
				return els;	
			},
			
			getConf: function() {
				return conf;	
			},		
			
			isLoaded: function() {
				return loaded;	
			},
			
			load: function(e) { 
				
				// already loaded ?
				if (loaded) { return self;	}
	
				origIndex = els.eq(0).css("zIndex"); 				
				
				// find existing mask
				if (conf.maskId) { mask = $("#" + conf.maskId);	}
					
				if (!mask || !mask.length) {
					
					var size = viewport();
					
					mask = $('<div/>').css({				
						position:'absolute', 
						top:0, 
						left:0,
						width: size[0],
						height: size[1],
						display:'none',
						opacity: 0,					 		
						zIndex:conf.zIndex	
					});						
					
					// id
					if (conf.maskId) { mask.attr("id", conf.maskId); }					
					
					$("body").append(mask);	
					
					
					// background color 
					var bg = mask.css("backgroundColor");
					
					if (!bg || bg == 'transparent' || bg == 'rgba(0, 0, 0, 0)') {
						mask.css("backgroundColor", conf.color);	
					}   
					
					// esc button
					if (conf.closeOnEsc) {						
						$(document).bind("keydown.unexpose", function(evt) {							
							if (evt.keyCode == 27) {
								self.close();	
							}		
						});			
					}
					
					// mask click closes
					if (conf.closeOnClick) {
						mask.bind("click.unexpose", function(e)  {
							self.close(e);		
						});					
					}					
				}				
				
				// possibility to cancel click action
				e = e || $.Event();
				e.type = "onBeforeLoad";
				$self.trigger(e);			
				
				if (e.isDefaultPrevented()) { return self; }
				
				// make sure element is positioned absolutely or relatively
				$.each(els, function() {
					var el = $(this);
					if (!/relative|absolute|fixed/i.test(el.css("position"))) {
						el.css("position", "relative");		
					}					
				});
			 
				// make elements sit on top of the mask				
				els.css({zIndex:Math.max(conf.zIndex + 1, origIndex == 'auto' ? 0 : origIndex)});				

				
				// reveal mask
				var h = mask.height();
				
				if (!this.isLoaded()) { 
					
					mask.css({opacity: 0, display: 'block'}).fadeTo(conf.loadSpeed, conf.opacity, function() {

						// sometimes IE6 misses the height property on fadeTo method
						if (mask.height() != h) { mask.css("height", h); }
						e.type = "onLoad";						
						$self.trigger(e);	
						 
					});					
				}
					
				loaded = true;
				
				return self;
			}, 
			
			
			close: function(e) {
								
				if (!loaded) { return self; }   

				e = e || $.Event();
				e.type = "onBeforeClose";
				$self.trigger(e);				
				if (e.isDefaultPrevented()) { return self; }
				
				mask.fadeOut(conf.closeSpeed, function() {
					e.type = "onClose";
					$self.trigger(e);
					els.css({zIndex: $.browser.msie ? origIndex : null});
				});        										
				
				loaded = false;
				return self; 
			},
			
			fit: function() {
				if (mask) {
					var size = viewport();				
					mask.css({ width: size[0], height: size[1]});
				}	
			},
			
			bind: function(name, fn) {
				$self.bind(name, fn);
				return self;	
			},			
			
			unbind: function(name) {
				$self.unbind(name);
				return self;	
			}				
			
		});		
		
		// callbacks	
		$.each("onBeforeLoad,onLoad,onBeforeClose,onClose".split(","), function(i, ev) {
			self[ev] = function(fn) {
				return self.bind(ev, fn);	
			};
		});			

	}
	
	
	// jQuery plugin implementation
	$.fn.expose = function(conf) {
		
		var el = this.eq(typeof conf == 'number' ? conf : 0).data("expose");
		if (el) { return el; }
		
		if (typeof conf == 'string') {
			conf = {color: conf};
		}
		
		var globals = $.extend({}, $.tools.expose.conf);
		conf = $.extend(globals, conf);		

		// construct exposes
		this.each(function() {
			el = new Expose($(this), conf);
			$(this).data("expose", el);	 
		});		
		
		return conf.api ? el: this;		
	};		


})(jQuery);
