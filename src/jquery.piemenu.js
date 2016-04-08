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
			parent : $(false),
			button : $(false),
			ul     : $(element)
		};

		// options
		this.options = options;

		// initialize
		this.init();
	}

	Plugin.prototype = {

		/**
		 * Default options
		 * @type {Object}
		 */
		_defaults: {
			range  : 270,
			center : 0,
			margin : 6
		},

		/**
		 * Fix this.options
		 * @return {Void}
		 */
		_options: function() {
			// extend with _defaults
			this.options = $.extend({}, this._defaults, this.options);

			// numeric
			this.options.range  = this.options.range  * 1;
			this.options.center = this.options.center * 1;
			this.options.margin = this.options.margin * 1;

			// not a number
			if (isNaN(this.options.range))  this.options.range  = _defaults.range;
			if (isNaN(this.options.center)) this.options.center = _defaults.center;
			if (isNaN(this.options.margin)) this.options.margin = _defaults.margin;

			// values
			if (this.options.range  <= 0) this.options.range  = _defaults.range;
			if (this.options.margin <  0) this.options.margin = 0;
		},

		/**
		 * Create template
		 * @return {Void}
		 */
		_create: function() {
			// wrap parent
			this.$ui.parent = $("<div />")
				.attr("class", ns);
			this.$ui.ul.wrap(this.$ui.parent);
			this.$ui.parent = this.$ui.ul.parent();

			// create button
			this.$ui.button = $("<button />")
				.text("Toggle")
				.appendTo(this.$ui.parent);
		},

		/**
		 * Bind events
		 * @return {Void}
		 */
		_bind: function() {
			var $wrap = this.$ui.parent;

			// bind click event
			this.$ui.button.on("click", function() {
				$wrap.toggleClass("active");
			});
		},

		/**
		 * Calculate rotate and skew for each element
		 * @return {Void}
		 */
		render: function() {
			var that    = this;
			that.$ui.li = that.$ui.ul.children("li");
			that.$ui.a  = that.$ui.li.children("a");

			var range  = that.options.range;
			var margin = that.options.margin;
			var slice  = range / that.$ui.li.length - margin;
			var skew   = 90 - slice;
			var start  = range / -2 + that.options.center;

			// rotate and skew li elements
			that.$ui.li.each(function() {
				var rotate = 0
					+ start
					+ margin / 2
					+ that.$ui.li.index(this) * (slice + margin);

				$(this).css("transform", "rotate(" + rotate + "deg) skewY(" + -1 * skew + "deg)");
			});

			// skew and rotate a elements
			that.$ui.a.css("transform", "skewY(" + skew + "deg) rotate(" + (slice / 2) + "deg)");
		},

		/**
		 * Constructor
		 * @return {Void}
		 */
		init: function() {
			this.$ui.ul.data("jquery." + ns, this);

			this._options();
			this._create();
			this._bind();

			this.render();
		},

		/**
		 * Destructor
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
				.insertAfter(this.$ui.parent);

			// remove parent
			this.$ui.parent
				.remove();

			// remove button
			this.$ui.button
				.remove();

			// clear variables
			this.$ui     = undefined;
			this.options = undefined;
		}

	}

	$.fn[ns] = function(options) {
		var arg = arguments;
		var obj = this;
		var val = this;

		$(this).each(function() {
			var plugin = $(this).data("jquery." + ns);

			if ( ! plugin) {
				console.log("new plugin")
				plugin = new Plugin(this, options);
			}
			if (plugin && typeof(options) === "string" && typeof(plugin[options]) === "function" && options.substr(0, 1) != "_") {
				console.log("apply", plugin, Array.prototype.slice.call(arg, 1));
				val = plugin[options].apply(plugin, Array.prototype.slice.call(arg, 1));
			}
		});

		return val || obj;
	}

	$(document).ready(function() {
		$('ul[data-' + ns + '-autoinit')[ns]();
	});

})(jQuery);
