// Custom JavaScript for Chat Application Documentation

document.addEventListener("DOMContentLoaded", function () {
  // Add copy button functionality for code blocks
  const codeBlocks = document.querySelectorAll("pre code");

  codeBlocks.forEach(function (codeBlock) {
    const pre = codeBlock.parentElement;

    // Skip if already has a copy button
    if (pre.querySelector(".copy-button")) {
      return;
    }

    // Create copy button
    const button = document.createElement("button");
    button.className = "copy-button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");

    // Add click handler
    button.addEventListener("click", function () {
      const code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(function () {
        button.textContent = "Copied!";
        button.classList.add("copied");

        setTimeout(function () {
          button.textContent = "Copy";
          button.classList.remove("copied");
        }, 2000);
      });
    });

    pre.appendChild(button);
  });

  // Add anchor links to headings
  const headings = document.querySelectorAll("h2, h3, h4");

  headings.forEach(function (heading) {
    if (heading.id) {
      const anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = "#" + heading.id;
      anchor.innerHTML = "#";
      anchor.setAttribute("aria-label", "Link to this heading");
      heading.appendChild(anchor);
    }
  });

  // Enhance external links
  const externalLinks = document.querySelectorAll('a[href^="http"]');

  externalLinks.forEach(function (link) {
    // Skip if it's an internal link
    if (link.hostname === window.location.hostname) {
      return;
    }

    // Add external link icon
    link.classList.add("external-link");
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // Add smooth scrolling to anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Update URL without scrolling
        history.pushState(null, null, "#" + targetId);
      }
    });
  });

  // Add table of contents highlighting
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const id = entry.target.getAttribute("id");
        if (!id) return;

        const tocLink = document.querySelector(
          '.md-nav__link[href="#' + id + '"]'
        );
        if (tocLink) {
          if (entry.isIntersecting) {
            tocLink.classList.add("md-nav__link--active");
          } else {
            tocLink.classList.remove("md-nav__link--active");
          }
        }
      });
    },
    {
      rootMargin: "-20% 0px -80% 0px",
    }
  );

  // Observe all headings
  document.querySelectorAll("h2[id], h3[id]").forEach(function (heading) {
    observer.observe(heading);
  });

  // Add print-friendly mode
  window.addEventListener("beforeprint", function () {
    document.body.classList.add("printing");
  });

  window.addEventListener("afterprint", function () {
    document.body.classList.remove("printing");
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Press 's' to focus search
    if (e.key === "s" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const searchInput = document.querySelector(".md-search__input");
      if (searchInput && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }

    // Press '/' to focus search (alternative)
    if (e.key === "/") {
      const searchInput = document.querySelector(".md-search__input");
      if (searchInput && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
  });
});

// Add version warning for outdated pages
(function () {
  const versionWarning = document.createElement("div");
  versionWarning.className = "version-warning";
  versionWarning.style.cssText =
    "display:none;background:#fff3cd;padding:1rem;margin:1rem 0;border-radius:0.5rem;border-left:4px solid #ffc107;";
  versionWarning.innerHTML =
    '<strong>⚠️ Note:</strong> You are viewing documentation for an older version. <a href="/latest/">View latest version</a>';

  const content = document.querySelector(".md-content");
  if (content && window.location.pathname.includes("/v0.")) {
    content.insertBefore(versionWarning, content.firstChild);
    versionWarning.style.display = "block";
  }
})();
