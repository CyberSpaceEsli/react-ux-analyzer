import React from "react";

// BAD: Inputs with complex types but no placeholder or tooltip
function BadInputWithoutHints() {
  return (
    <form>
      <label>
        Date of Birth:
        <input type="date" />
      </label>
      <label>
        Phone Number:
        <input type="tel" /> 
      </label>
    </form>
  );
}

// BAD: Footer contains primary navigation (not visible up top)
function BadFooterNavigation() {
  return (
    <footer>
        <p>© 2025 Company</p>
    </footer>
  );
}

// BAD: Multilevel dropdown menu (without clear affordances)
function BadMultilevelDropdown() {
  return (
    <nav>
      <ul>
        <li>
          Products
          <ul>
            <li>
              Software
              <ul>
                <li><a href="/products/software/analytics">Analytics</a></li>
                <li><a href="/products/software/monitoring">Monitoring</a></li>
              </ul>
            </li>
            <li><a href="/products/hardware">Hardware</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}

// BAD: Menu items are more than 7 without grouping
function BadOverloadedMenu() {
    return (
   <nav>
    <ul>
        <li><a href="/1">One</a></li>
        <li><a href="/2">Two</a></li>
        <li><a href="/3">Three</a></li>
        <li><a href="/4">Four</a></li>
        <li><a href="/5">Five</a></li>
        <li><a href="/6">Six</a></li>
        <li><a href="/7">Seven</a></li>
        <li><a href="/8">Eight</a></li>
    </ul>
    </nav>
    );
}

//Bad: nav wit react router links with more than 7 items without grouping
function BadNavWithManyLinks() {
    return (
    <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/about">About</Link> |{" "}
        <Link to="/contact">Contact</Link>
        <Link to="/finance">Finance</Link>
        <Link to="/support">Support</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/legal">Legal</Link>
        <Link to="/blog">Blog</Link>
    </nav>
    );
}

// BAD: Menu items that open submenus but have no arrow/caret icon
function BadSubmenuWithoutIcon() {
  return (
    <nav>
      <ul>
        <li>
          Account
          <ArrowRightIcon />
          <ul>
            <li>
            <span>Settings</span>
            </li>
            <li><a href="/account/settings">Settings</a></li>
          </ul>
        </li>
        <li>
         Help
          <ul>
             <li><a href="/help/docs">Docs</a></li>
            <li><a href="/help/contact">Contact Support</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}

//mock components
function ArrowRightIcon() {
    return <svg>▶</svg>;
}

function Link({ to, children }) {
    return <a href={to}>{children}</a>;
}

export {
  BadInputWithoutHints,
  BadFooterNavigation,
  BadMultilevelDropdown,
  BadOverloadedMenu,
  BadNavWithManyLinks,
  BadSubmenuWithoutIcon
};