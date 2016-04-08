;(function($) {

	var ns = "piemenu";

	var Plugin = function(element, options) {
		// empty arguments
		element = element || {};
		options = options || {};

		// init once
		if ($(element).data("jquery." + ns)) {
			return;
		}

		// only ul
		if ( ! $(element).is("ul")) {
			return;
		}

		// define template elements
		this.$ui = {
			wrapper : $(false),
			content : $(false),
			button  : $(false),
			ul      : $(element)
		};

		// options
		this._options = options;

		// initialize
		this.init();
	}

	Plugin.prototype = {

		/**
		 * Default options
		 *
		 * @type {Object}
		 */
		_defaults: {
			range  : 270,
			center : 0,
			margin : 6
		},

		/**
		 * Fix this._options
		 *
		 * @return {Void}
		 */
		_config: function() {
			var options   = $.extend({}, this._options);
			this._options = $.extend({}, this._defaults);

			for (var key in this._defaults) {
				if (key in options) {
					this.options(key, options[key]);
				}
			}
		},

		/**
		 * Create template
		 *
		 * @return {Void}
		 */
		_create: function() {
			this.$ui.ul.wrap("<div />");
			this.$ui.content = this.$ui.ul.parent();

			this.$ui.content.wrap("<div />");
			this.$ui.wrapper = this.$ui.content.parent()
				.attr("class", ns);

			this.$ui.button = $("<button />")
				.text("Toggle")
				.appendTo(this.$ui.wrapper);
		},

		/**
		 * Bind events
		 *
		 * @return {Void}
		 */
		_bind: function() {
			var $wrapper = this.$ui.wrapper;

			// bind click event
			this.$ui.button.on("click", function() {
				$wrapper.toggleClass("active");
			});
		},

		/**
		 * Get/set option key
		 *
		 * @param  {String} key
		 * @param  {Mixed}  value
		 * @return {Mixed}
		 */
		options: function(key, value) {
			if (typeof value === "undefined") {
				return this._options[key];
			}

			if (key in this._defaults && ! isNaN(value * 1)) {
				this._options[key] = value * 1;

				if (this._options.range  <=   0) this._options.range  = this._defaults.range;
				if (this._options.range  >  360) this._options.range  = 360;
				if (this._options.margin <    0) this._options.margin = 0;

				this.render();
			}
		},

		/**
		 * Set rotate and skew for each element
		 *
		 * @return {Void}
		 */
		render: function() {
			// check new elements
			var that    = this;
			that.$ui.li = that.$ui.ul.children("li");
			that.$ui.a  = that.$ui.li.children("a");

			// calculations
			var range  = that.options("range");
			var margin = that.options("margin");
			var center = that.options("center");
			var length = that.$ui.li.length;
			var slice  = range / length - margin;
			var skew   = 90 - slice;
			var start  = range / -2 + center;

			// rotate content so li elements with rotate(0deg) will be positioned on center
			that.$ui.content.css("transform", "rotate(" + slice / -2 + "deg)");

			// rotate and skew li elements
			that.$ui.li.css("transform", function() {
				var rotate = 0
					+ start
					+ margin / 2
					+ that.$ui.li.index(this) * (slice + margin)
					- slice / -2;

				return "rotate(" + rotate + "deg) skewY(" + -1 * skew + "deg)";
			});

			// skew and rotate a elements
			that.$ui.a.css("transform", "skewY(" + skew + "deg) rotate(" + (slice / 2) + "deg)");
		},

		/**
		 * Constructor
		 *
		 * @return {Void}
		 */
		init: function() {
			this.$ui.ul.data("jquery." + ns, this);

			this._config();
			this._create();
			this._bind();

			this.render();
		},

		/**
		 * Destructor
		 *
		 * @return {Void}
		 */
		destroy: function() {
			// reset rotate/skew
			this.$ui.li
				.css("transform", "");

			// remove plugin from element
			this.$ui.ul
				.removeData("jquery." + ns)
				.detach()
				.insertAfter(this.$ui.wrapper);

			// remove wrapper
			this.$ui.wrapper
				.remove();

			// clear variables
			this.$ui     = undefined;
			this._options = undefined;
		}

	}

	$.fn[ns] = function(options) {
		var arg = arguments;
		var obj = this;
		var val = this;

		$(this).each(function() {
			var plugin = $(this).data("jquery." + ns);

			if ( ! plugin) {
				plugin = new Plugin(this, options);
			}
			if (plugin && typeof(options) === "string" && typeof(plugin[options]) === "function" && options.substr(0, 1) != "_") {
				val = plugin[options].apply(plugin, Array.prototype.slice.call(arg, 1));
			}
		});

		return val || obj;
	}

	$(document).ready(function() {
		$('ul[data-' + ns + '-autoinit')[ns]();
	});

})(jQuery);
