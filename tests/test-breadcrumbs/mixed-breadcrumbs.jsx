import React from 'react';

// Test file with MIXED breadcrumb patterns - Some good, some bad

const MixedBreadcrumbsPage = () => {
  return (
    <div className="app">
      {/* Good: Has breadcrumb navigation */}
      <nav role="navigation" aria-label="breadcrumb">
        <ul className="breadcrumb-list">
          <li><a href="/">Dashboard</a></li>
          <li><a href="/products">Products</a></li>
          <li>Electronics</li>
        </ul>
      </nav>

      <Page className="electronics-page">
        <h1>Electronics Category</h1>
        
        {/* Bad: Deep section without local breadcrumbs */}
        <Section className="laptops">
          <h2>Laptops</h2>
          
          <Container className="product-grid">
            <div className="product-item">
              <h3>Gaming Laptop</h3>
              {/* User lost in hierarchy: Dashboard > Products > Electronics > Laptops > Gaming Laptop */}
            </div>
          </Container>
        </Section>
      </Page>

      {/* Pattern with separators but not navigation terms */}
      <div className="some-content">
        <span>Option A / Option B / Option C</span>
      </div>

      {/* Good: Another breadcrumb pattern */}
      <BreadCrumbs 
        items={[
          {label: 'Home', href: '/'},
          {label: 'Shop', href: '/shop'},
          {label: 'Current Category', active: true}
        ]}
      />

      {/* Bad: Main component without breadcrumbs */}
      <Main className="checkout">
        <h1>Checkout Process</h1>
        <p>Step 3 of 5 - but no breadcrumb showing overall navigation</p>
      </Main>
      
      {/* Bad: Deeply nested component far from breadcrumbs */}
      <div className="spacer" style={{height: '200px'}}></div>
      <div className="spacer" style={{height: '200px'}}></div>
      <div className="spacer" style={{height: '200px'}}></div>
      
      <Container className="user-account">
        <h2>Account Settings</h2>
        <Section className="privacy-settings">
          <h3>Privacy Controls</h3>
          <p>Users are lost: Home → Account → Settings → Privacy → Controls</p>
        </Section>
      </Container>
      
      {/* Bad: Another isolated page component */}
      <div className="spacer" style={{height: '200px'}}></div>
      
      <Article className="help-article">
        <h1>Help Documentation</h1>
        <p>No breadcrumb context for this help section</p>
      </Article>
    </div>
  );
};

// Mock components
const Page = ({ children, className }) => <div className={className}>{children}</div>;
const Section = ({ children, className }) => <section className={className}>{children}</section>;
const Container = ({ children, className }) => <div className={className}>{children}</div>;
const Main = ({ children, className }) => <main className={className}>{children}</main>;
const BreadCrumbs = ({ items }) => <nav>Breadcrumbs</nav>;
const Article = ({ children, className }) => <article className={className}>{children}</article>;

export default MixedBreadcrumbsPage;
