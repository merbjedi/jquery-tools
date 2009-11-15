/**
 * jQuery TOOLS plugin :: tabs.history 1.0.2
 * 
 * Copyright (c) 2009 Tero Piirainen
 * http://flowplayer.org/tools/tabs.html#history
 *
 * Dual licensed under MIT and GPL 2+ licenses
 * http://www.opensource.org/licenses
 *
 * Launch  : September 2009
 * Date: ${date}
 * Revision: ${revision} 
 */
(function($) {
	
	var t = $.tools.tabs; 
	t.plugins = t.plugins || {};
	
	t.plugins.history = { 
		version: '1.0.2',		
		conf: {
			api: false
		}		
	};
		
	var hash, iframe;		

	function setIframe(h) {
		if (h) {
			var doc = iframe.contentWindow.document;
			doc.open().close();	
			doc.location.hash = h;
		}
	}
	
	// jQuery plugin implementation
	$.fn.onHash = function(fn) {
			
		var el = this;
		
		// IE
		if ($.browser.msie && $.browser.version < '8') {
			
			// create iframe that is constantly checked for hash changes
			if (!iframe) {
				iframe = $("<iframe/>").attr("src", "javascript:false;").hide().get(0);
				$("body").append(iframe);
								
				setInterval(function() {
					var idoc = iframe.contentWindow.document, 
						 h = idoc.location.hash;
				
					if (hash !== h) {						
						$.event.trigger("hash", h);
						hash = h;
					}
				}, 100);
				
				setIframe(location.hash || '#');
			}
			
			// when link is clicked the iframe hash updated
			el.bind("click.hash", function(e) {
				setIframe($(this).attr("href"));
			}); 

			
		// other browsers scans for location.hash changes directly withou iframe hack
		} else { 
			setInterval(function() {
				var h = location.hash;
				var els = el.filter("[href$=" + h + "]");
				
				if (!els.length) { 
					h = h.replace("#", "");
					els = el.filter("[href$=" + h + "]");
				}
				
				if (els.length && h !== hash) {
					hash = h;
					$.event.trigger("hash", h);
				}						
			}, 100);
		}
		 
		// bind a history listener
		$(window).bind("hash", fn);
		
		// return jQuery
		return this;		
	};	
	

	$.fn.history = function(conf) {
	
		var globals = $.extend({}, t.plugins.history.conf), ret;
		conf = $.extend(globals, conf);
		
		this.each(function() {
			
			var api = $(this).tabs(), 
				 tabs = api.getTabs();
				 
			if (api) { ret = api; }
			
			// enable history support
			tabs.onHash(function(evt, hash) {
				if (!hash || hash == '#') { hash = api.getConf().initialIndex; }
				api.click(hash);		
			});	  
 			
			// tab clicks perform their original action
			tabs.click(function(e) {
				location.hash = $(this).attr("href").replace("#", "");	
			}); 

		});
		
		return conf.api ? ret : this;
		
	};
		
})(jQuery); 

