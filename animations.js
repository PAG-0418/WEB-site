;(function () {
	'use strict'

	var root = document.documentElement
	root.classList.add('vv-js')

	var reduce =
		window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

	var failSafe = setTimeout(function () {
		root.classList.remove('vv-js')
	}, 4000)

	var REVEAL =
		'.promo-slider, .content h2, .cart-container h1, .product-card, .footer-left, .footer-right, .footer-logo, .image-frame, .product-info-section, .about-title, .about-content, .box, .cart-summary'

	function ready(fn) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn)
		} else {
			fn()
		}
	}

	function wrapCardImages() {
		document.querySelectorAll('.product-card > img').forEach(function (img) {
			var box = document.createElement('div')
			box.className = 'vv-media'
			img.parentNode.insertBefore(box, img)
			box.appendChild(img)
		})
	}

	function initReveal() {
		var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL))

		if (reduce || !('IntersectionObserver' in window)) {
			targets.forEach(function (el) {
				el.classList.add('vv-in')
			})
			return
		}

		var io = new IntersectionObserver(
			function (entries) {
				var visible = entries
					.filter(function (e) {
						return e.isIntersecting
					})
					.sort(function (a, b) {
						var ra = a.boundingClientRect
						var rb = b.boundingClientRect
						return ra.top - rb.top || ra.left - rb.left
					})

				visible.forEach(function (entry, i) {
					var el = entry.target
					el.style.animationDelay = Math.min(i, 6) * 90 + 'ms'
					el.classList.add('vv-in')
					io.unobserve(el)
					setTimeout(function () {
						el.style.animationDelay = ''
					}, 1600)
				})
			},
			{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
		)

		targets.forEach(function (el) {
			io.observe(el)
		})
	}

	function initProgress() {
		var bar = document.createElement('div')
		var fill = document.createElement('span')
		bar.className = 'vv-progress'
		bar.setAttribute('aria-hidden', 'true')
		bar.appendChild(fill)
		document.body.appendChild(bar)

		var ticking = false

		function update() {
			var max = root.scrollHeight - window.innerHeight
			var p = max > 0 ? window.pageYOffset / max : 0
			fill.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')'
			ticking = false
		}

		window.addEventListener(
			'scroll',
			function () {
				if (!ticking) {
					ticking = true
					window.requestAnimationFrame(update)
				}
			},
			{ passive: true },
		)
		window.addEventListener('resize', update)
		update()
	}

	function initParallax() {
		var slider = document.querySelector('.promo-slider')
		if (!slider || reduce) return

		var ticking = false

		function update() {
			var r = slider.getBoundingClientRect()
			var vh = window.innerHeight
			var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)
			p = Math.max(-1, Math.min(1, p))
			slider.style.setProperty('--vv-py', (p * -6).toFixed(1) + 'px')
			ticking = false
		}

		window.addEventListener(
			'scroll',
			function () {
				if (!ticking) {
					ticking = true
					window.requestAnimationFrame(update)
				}
			},
			{ passive: true },
		)
		update()
	}

	function initCartBump() {
		var count = document.getElementById('cart-count')
		if (!count) return

		var last = count.textContent

		new MutationObserver(function () {
			var now = count.textContent
			if (now === last) return
			last = now
			count.classList.remove('vv-bump')
			void count.offsetWidth
			count.classList.add('vv-bump')
		}).observe(count, { childList: true, characterData: true, subtree: true })
	}

	function initCartItems() {
		var list = document.getElementById('cart-items')
		if (!list) return

		var timer = null

		new MutationObserver(function () {
			if (timer || list.classList.contains('vv-settled')) return
			if (list.querySelector('.cart-item')) {
				timer = setTimeout(function () {
					list.classList.add('vv-settled')
				}, 1600)
			}
		}).observe(list, { childList: true })
	}

	function initToast() {
		new MutationObserver(function (mutations) {
			mutations.forEach(function (m) {
				m.addedNodes.forEach(function (node) {
					if (
						node.nodeType === 1 &&
						node.tagName === 'DIV' &&
						node.style &&
						node.style.position === 'fixed'
					) {
						node.classList.add('vv-toast')
						setTimeout(function () {
							node.classList.add('vv-toast-out')
						}, 2500)
					}
				})
			})
		}).observe(document.body, { childList: true })
	}

	function initRipple() {
		var SELECTOR =
			'.product-card button, .buy-btn, .back-btn, .checkout-btn, .contact_btn'

		document.addEventListener('click', function (e) {
			var btn = e.target.closest ? e.target.closest(SELECTOR) : null
			if (!btn) return

			var rect = btn.getBoundingClientRect()
			var size = Math.max(rect.width, rect.height) * 2
			var dot = document.createElement('span')
			dot.className = 'vv-ripple'
			dot.style.width = dot.style.height = size + 'px'
			dot.style.left = e.clientX - rect.left - size / 2 + 'px'
			dot.style.top = e.clientY - rect.top - size / 2 + 'px'
			btn.appendChild(dot)
			setTimeout(function () {
				if (dot.parentNode) dot.parentNode.removeChild(dot)
			}, 800)
		})
	}

	ready(function () {
		try {
			wrapCardImages()
			initReveal()
			initProgress()
			initParallax()
			initCartBump()
			initCartItems()
			initToast()
			initRipple()
			clearTimeout(failSafe)
		} catch (err) {
			root.classList.remove('vv-js')
			clearTimeout(failSafe)
		}
	})
})()
