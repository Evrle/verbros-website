/* Verbros Technologies — site behaviour */
(function () {
  "use strict";

  var CONTACT_EMAIL = "info@verbros.com";
  var PRODUCTS = {
    argus: "ARGUS — Video Analytics + LLM Insights",
    iris: "IRIS — AI Smart Mirror",
    muse: "MUSE — AI Smart Mannequin",
    atlas: "ATLAS — Supply Chain Intelligent Assistant (SCIA)",
    custom: "A custom AI project",
    partner: "Partnership",
    other: "Something else"
  };

  /* ---------- Header: scrolled state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      var path = toggle.querySelector("path");
      if (path) path.setAttribute("d", open ? "M6 6l12 12M18 6L6 18" : "M3 7h18M3 12h18M3 17h18");
    });
  }

  /* ---------- Products dropdown (click / keyboard / touch) ---------- */
  document.querySelectorAll(".has-menu").forEach(function (item) {
    var btn = item.querySelector("button.nav-link");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) {
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  });

  /* ---------- Sub-navigation highlight on product pages ---------- */
  var subLinks = Array.prototype.slice.call(document.querySelectorAll(".subnav a[href^='#']"));
  if (subLinks.length && "IntersectionObserver" in window) {
    var map = {};
    subLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          subLinks.forEach(function (a) { a.classList.remove("active"); });
          var a = map[en.target.id];
          if (a) {
            a.classList.add("active");
            var ul = a.closest("ul");
            if (ul && ul.scrollWidth > ul.clientWidth) {
              ul.scrollTo({ left: a.offsetLeft - 24, behavior: "smooth" });
            }
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = btn.textContent;
      function done(msg) {
        btn.textContent = msg;
        setTimeout(function () { btn.textContent = label; }, 1800);
      }
      try {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { selectFallback(); });
      } catch (err) { selectFallback(); }
      function selectFallback() {
        var target = btn.closest(".channel") && btn.closest(".channel").querySelector(".value");
        if (target) {
          var r = document.createRange();
          r.selectNodeContents(target);
          var s = window.getSelection();
          s.removeAllRanges();
          s.addRange(r);
          done("Selected, press Ctrl+C");
        }
      }
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("enquiry-form");
  if (!form) return;

  var select = document.getElementById("f-product");
  var chip = document.getElementById("enquiry-chip");
  var chipName = document.getElementById("enquiry-chip-name");
  var statusBox = document.getElementById("form-status");

  function applyHash() {
    var h = (window.location.hash || "").replace("#", "");
    var m = h.match(/^enquire-([a-z]+)$/);
    if (m && PRODUCTS[m[1]]) {
      select.value = m[1];
      showChip(m[1]);
      var card = document.getElementById("enquire");
      if (card) setTimeout(function () {
        var hdr = document.querySelector(".site-header");
        var offset = (hdr ? hdr.offsetHeight : 72) + 20;
        window.scrollTo({ top: card.getBoundingClientRect().top + window.pageYOffset - offset, behavior: "smooth" });
      }, 60);
      var msg = document.getElementById("f-message");
      if (msg && !msg.value) {
        msg.placeholder = "Tell us about your " + (m[1] === "atlas" ? "systems, sites and what you would like to ask or automate." : "stores, sites or cameras and what you would like to measure.");
      }
    }
  }
  function showChip(key) {
    if (!chip) return;
    if (PRODUCTS[key] && ["argus", "iris", "muse", "atlas"].indexOf(key) > -1) {
      chipName.textContent = PRODUCTS[key].split(" — ")[0];
      chip.hidden = false;
    } else {
      chip.hidden = true;
    }
  }
  if (chip) {
    chip.querySelector("button").addEventListener("click", function () {
      chip.hidden = true;
      select.value = "";
    });
  }
  select.addEventListener("change", function () { showChip(select.value); });
  window.addEventListener("hashchange", applyHash);
  applyHash();

  function setInvalid(field, bad) {
    var wrap = field.closest(".field");
    if (wrap) wrap.classList.toggle("invalid", bad);
    field.setAttribute("aria-invalid", bad ? "true" : "false");
  }
  function validate() {
    var ok = true;
    var first = null;
    form.querySelectorAll("[required]").forEach(function (f) {
      var bad = !f.value.trim() || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      setInvalid(f, bad);
      if (bad) { ok = false; if (!first) first = f; }
    });
    if (first) first.focus();
    return ok;
  }
  form.querySelectorAll("input, textarea, select").forEach(function (f) {
    f.addEventListener("input", function () { if (f.closest(".field.invalid")) setInvalid(f, false); });
  });

  function mailtoLink(data) {
    var subject = "Website enquiry" + (data.product ? ": " + data.product : "");
    var body = "Name: " + data.name + "\nCompany: " + (data.company || "-") + "\nEmail: " + data.email + "\nPhone: " + (data.phone || "-") + "\nInterested in: " + (data.product || "-") + "\n\n" + data.message;
    return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function showStatus(kind, data) {
    statusBox.className = "form-status " + kind;
    statusBox.hidden = false;
    statusBox.innerHTML = "";
    var h = document.createElement("h3");
    var p = document.createElement("p");
    if (kind === "ok") {
      h.textContent = "Thanks, " + data.name.split(" ")[0] + ". Your enquiry has been sent.";
      p.textContent = "It has reached our team at " + CONTACT_EMAIL + ". We will reply to " + data.email + ".";
      statusBox.appendChild(h);
      statusBox.appendChild(p);
    } else {
      h.textContent = "Your enquiry could not be sent from this page.";
      p.innerHTML = "Please email us at <strong>" + CONTACT_EMAIL + "</strong> or call <strong>+91 746 000 2107</strong>. ";
      var a = document.createElement("a");
      a.href = mailtoLink(data);
      a.textContent = "Open this enquiry in your email app";
      p.appendChild(a);
      statusBox.appendChild(h);
      statusBox.appendChild(p);
    }
    statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    var data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      company: form.elements.company.value.trim(),
      product: PRODUCTS[select.value] || "",
      message: form.elements.message.value.trim()
    };
    if (form.elements._honey && form.elements._honey.value) return; // spam trap
    var btn = form.querySelector("button[type=submit]");
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";

    var payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      interested_in: data.product,
      message: data.message,
      _subject: "Website enquiry" + (data.product ? ": " + data.product : ""),
      _template: "table",
      _captcha: "false"
    };

    var finished = false;
    var timer = setTimeout(function () { if (!finished) { finished = true; reset(); showStatus("fail", data); } }, 15000);
    function reset() { btn.disabled = false; btn.textContent = label; }

    fetch("https://formsubmit.co/ajax/" + CONTACT_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (finished) return;
        finished = true; clearTimeout(timer); reset();
        if (res && (res.success === true || res.success === "true")) {
          form.reset();
          if (chip) chip.hidden = true;
          showStatus("ok", data);
        } else {
          showStatus("fail", data);
        }
      })
      .catch(function () {
        if (finished) return;
        finished = true; clearTimeout(timer); reset();
        showStatus("fail", data);
      });
  });
})();
