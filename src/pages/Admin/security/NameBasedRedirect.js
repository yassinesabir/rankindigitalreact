// RedirectBasedOnUsername.js
import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const RedirectBasedOnName = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      const username = keycloak.tokenParsed?.preferred_username;

      if (username === 'yassine_sabir' || username === 'hasnaa_ettaki') {
        window.location.replace('/Commercial/Charts');
      } else {
        setIsRedirecting(false); // No redirection needed, allow access
      }
    }
  }, [initialized, keycloak]);

  if (isRedirecting) {
    // Optionally show a loading spinner while redirecting
    return <div>Loading...</div>;
  }

  return children; // Render the children components if no redirection is needed
};

export default RedirectBasedOnName;
