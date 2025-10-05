import React from 'react';

// ❌ Bad Example: header missing role and logo not linked
function BadHeader() {
  return (
    <header>
      <Logo /> {/* Logo missing link */}
      <h1>My Website</h1>
    </header>
  );
}

// ❌ Bad Example: main missing role
function BadMain() {
  return (
    <main>
      <p className="font-[CustomFont]">Some text</p>
      <p className="font-[CustomFont2]">Other text</p>
      <p className="font-[CustomFont3]">Another text</p> {/* 3rd font triggers feedback */}
    </main>
  );
}

// ❌ Bad Example: nav missing role
function BadNav() {
  return (
    <nav>
      <ul>
        <li>Home</li>
        <li>About</li>
      </ul>
    </nav>
  );
}

// ❌ Bad Example: footer missing role
function BadFooter() {
  return (
    <footer>
      <p>Copyright 2025</p>
    </footer>
  );
}

// ❌ Bad Example: logo as <img> not wrapped in <a>
function BadLogo() {
  return (
    <header role="banner">
      <img src="/logo.png" alt="Logo" /> {/* Missing link */}
    </header>
  );
}

//Mock component
function Logo() {
  return <span>LOGO</span>;
}

export { BadHeader, BadMain, BadNav, BadFooter, BadLogo, Logo };