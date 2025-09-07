import React from 'react';

// Test file with BAD/MISSING breadcrumb patterns - Should trigger warnings

const BadBreadcrumbsPage = () => {
  return (
    <div className="app-container">
      {/* Bad: Missing breadcrumbs in page layout */}
      <Page className="main-page">
        <header>
          <h1>User Settings</h1>
        </header>
        
        <main>
          {/* Bad: No navigation context provided */}
          <Section className="profile-section">
            <h2>Profile Information</h2>
            <p>This page lacks breadcrumb navigation.</p>
          </Section>
          
          <Container className="settings-container">
            <h3>Account Settings</h3>
            <p>Users don't know where they are in the system hierarchy.</p>
          </Container>
        </main>
      </Page>

      {/* Bad: Another page component without breadcrumbs */}
      <Layout className="dashboard">
        <div className="content">
          <h1>Dashboard</h1>
          <p>This dashboard has no navigation breadcrumbs.</p>
        </div>
      </Layout>

      {/* Bad: Main component without navigation context */}
      <Main className="product-details">
        <h1>Product: Laptop XYZ</h1>
        <p>User cannot see the path: Home &gt; Products &gt; Electronics &gt; Laptops &gt; Current Product</p>
      </Main>
    </div>
  );
};

// Another component with poor navigation
const AnotherBadPage = () => {
  return (
    <Container className="deep-page">
      <h1>Deep nested page</h1>
      <p>This could be 5 levels deep but user has no idea where they are.</p>
    </Container>
  );
};

// Mock components
const Page = ({ children, className = "" }) => <div className={className}>{children}</div>;
const Section = ({ children, className = "" }) => <section className={className}>{children}</section>;
const Container = ({ children, className = "" }) => <div className={className}>{children}</div>;
const Layout = ({ children, className = "" }) => <div className={className}>{children}</div>;
const Main = ({ children, className = "" }) => <main className={className}>{children}</main>;

export default BadBreadcrumbsPage;
