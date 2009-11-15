/**
 * Overlay Gallery plugin, version: 1.0.0
 * 
 * Copyright (c) 2009 Tero Piirainen
 * http://flowplayer.org/tools/overlay.html#gallery
 *
 * Dual licensed under MIT and GPL 2+ licenses
 * http://www.opensource.org/licenses
 *
 * Since  : July 2009
 * Date: ${date}
 * Revision: ${revision} 
 */
(function($) { 
		
	// TODO: next(), prev(), getIndex(), onChange event
	
	// version number
	var t = $.tools.overlay; 
	t.plugins = t.plugins || {};
	
	t.plugins.gallery = {
		version: '1.0.0', 
		conf: { 
			imgId: 'img',
			next: '.next',
			prev: '.prev',
			info: '.info',
			progress: '.progress',
			disabledClass: 'disabled',
			activeClass: 'active',
			opacity: 0.8,
			speed: 'slow',
			template: '<strong>${title}</strong> <span>Image ${index} of ${total}</span>',  
			autohide: true,
			preload: true,
			api: false
		}
	};			
	
	$.fn.gallery = function(opts) {
		
		var conf = $.extend({}, t.plugins.gallery.conf), api;
		$.extend(conf, opts);   	

		// common variables for all gallery images
		api = this.overlay();
		
		var links = this,
			 overlay = api.getOverlay(),
			 next = overlay.find(conf.next),
			 prev = overlay.find(conf.prev),
			 info = overlay.find(conf.info),
			 progress = overlay.find(conf.progress),
			 els = prev.add(next).add(info).css({opacity: conf.opacity}),
			 close = api.getClosers(), 			 
			 index;
		
		
//{{{ load 

		function load(el) {
			
			progress.fadeIn();
			els.hide(); close.hide();
			
			var url = el.attr("href"); 
			
			// download the image 
			var image = new Image();
			
			image.onload = function() {
				
				progress.fadeOut();
				
				// find image inside overlay
				var img = $("#" + conf.imgId, overlay); 
				
				// or append it to the overlay 
				if (!img.length) { 
					img = $("<img/>").attr("id", conf.imgId).css("visibility", "hidden");
					overlay.prepend(img);
				}
				
				// make initially invisible to get it's dimensions
				img.attr("src", url).css("visibility", "hidden"); 			
					
				// animate overlay to fit the image dimensions
				var width = image.width;
				var left = ($(window).width() - width) / 2;
					
				// calculate index number
				index = links.index(links.filter("[href=" +url+ "]"));	
				
				// activate trigger
				links.removeClass(conf.activeClass).eq(index).addClass(conf.activeClass);
				
				// enable/disable next/prev links
				var cls = conf.disabledClass;
				els.removeClass(cls);

				if (index === 0) { prev.addClass(cls); }
				if (index == links.length -1) { next.addClass(cls); }
				
				
				// set info text & width
				var text = conf.template
					.replace("${title}", el.attr("title") || el.data("title"))
					.replace("${index}", index + 1)
					.replace("${total}", links.length);
					
				var padd = parseInt(info.css("paddingLeft"), 10) +  parseInt(info.css("paddingRight"), 10);
				info.html(text).css({width: width - padd});				
				
				overlay.animate({
					width: width, height: image.height, left: left}, conf.speed, function() {
						
					// gradually show the image
					img.hide().css("visibility", "visible").fadeIn(function() {						
						if (!conf.autohide) { 
							els.fadeIn(); close.show(); 
						}														
					});								

				}); 
			};
			
			image.onerror = function() {
				overlay.fadeIn().html("Cannot find image " + url); 
			};
			
			image.src = url;
			
			if (conf.preload) {
				links.filter(":eq(" +(index-1)+ "), :eq(" +(index+1)+ ")").each(function()  {
					var img = new Image();
					img.src = $(this).attr("href");					
				});
			}
			
		}
		
//}}}


		// function to add click handlers to next/prev links	 
		function addClick(el, isNext)  {
			
			el.click(function() {
					
				if (el.hasClass(conf.disabledClass)) { return; }				
				
				// find the triggering link
				var trigger = links.eq(i = index + (isNext ? 1 : -1));			
					 
				// if found load it's href
				if (trigger.length) { load(trigger); }
				
			});				
		}

		// assign next/prev click handlers
		addClick(next, true);
		addClick(prev);

		
		// arrow keys
		$(document).keydown(function(evt) {
				
			if (!overlay.is(":visible") || evt.altKey || evt.ctrlKey) { return; }
			
			if (evt.keyCode == 37 || evt.keyCode == 39) {					
				var btn = evt.keyCode == 37 ? prev : next;
				btn.click();
				return evt.preventDefault();
			}	
			return true;			
		});		
		
		function showEls() {
			if (!overlay.is(":animated")) {
				els.show(); close.show();		
			}	
		}
		
		// autohide functionality
		if (conf.autohide) { 
			overlay.hover(showEls, function() { els.fadeOut();	close.hide(); }).mousemove(showEls);
		}		
		
		// load a proper gallery image when overlay trigger is clicked
		var ret;
		
		this.each(function() {
				
			var el = $(this), api = $(this).overlay(), ret = api;
			
			api.onBeforeLoad(function() {
				load(el);
			});
			
			api.onClose(function() {
				links.removeClass(conf.activeClass);	
			});			
		});  		
		
		return conf.api ? ret : this;
		
	};
	
})(jQuery);	
		
