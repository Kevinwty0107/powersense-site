document.documentElement.classList.add("js");

(function () {
  // Mobile nav toggle
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });
  }

  // Highlight the current page in the nav
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal-on-scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  // Animated stat counters (markup already holds the final text as fallback)
  var statEls = document.querySelectorAll(".stat-num[data-count]");
  function animateStat(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var duration = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduced && statEls.length) {
    var statIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateStat(e.target);
            statIo.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach(function (el) {
      statIo.observe(el);
    });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Enquiry forms: compose an email to PowerSense
  var POWERSENSE_EMAIL = "Taiyi.Wang@powersense.tech";
  document.querySelectorAll("form.mailto-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lines = [];
      var seen = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.disabled) return;
        var label = el.getAttribute("data-label") || el.name;
        if (el.type === "checkbox") {
          if (el.checked) {
            if (!seen[el.name]) {
              seen[el.name] = [];
              lines.push({ label: label, key: el.name, multi: true });
            }
            seen[el.name].push(el.value);
          }
        } else if (el.type === "radio") {
          if (el.checked) lines.push({ label: label, value: el.value });
        } else if (el.value) {
          lines.push({ label: label, value: el.value });
        }
      });
      var body = lines
        .map(function (l) {
          return l.multi
            ? l.label + ": " + seen[l.key].join(", ")
            : l.label + ": " + l.value;
        })
        .join("\n");
      var subject = form.getAttribute("data-subject") || "Enquiry — PowerSense";
      var href =
        "mailto:" +
        POWERSENSE_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body + "\n");
      var successId = form.getAttribute("data-success");
      var success = successId && document.getElementById(successId);
      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "center",
        });
      }
      window.location.href = href;
    });
  });
})();
