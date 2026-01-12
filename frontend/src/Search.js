import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Search() {
  const [searchType, setSearchType] = useState('pincode'); // 'pincode' or 'merchantId'
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setSearched(true);

    try {
      const query = new URLSearchParams({
        type: searchType,
        value: searchValue.trim()
      }).toString();

      const res = await fetch(`${API_URL}/merchants/search-advanced?${query}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.merchants || []);
        if (data.merchants.length === 0) {
          setError('No merchants found');
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error performing search');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '32px',
    color: '#333',
    margin: '0 0 10px 0'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#666',
    margin: 0
  };

  const formStyle = {
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  };

  const formGroupStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333'
  };

  const selectStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginBottom: '15px',
    boxSizing: 'border-box'
  };

  const inputContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  };

  const inputStyle = {
    flex: 1,
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: '10px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#0056b3'
  };

  const [buttonHover, setButtonHover] = useState(false);

  const errorStyle = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  };

  const loadingStyle = {
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
    padding: '20px'
  };

  const resultsContainerStyle = {
    marginTop: '30px'
  };

  const resultsHeaderStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #007bff'
  };

  const merchantCardStyle = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s'
  };

  const merchantCardHoverStyle = {
    ...merchantCardStyle,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  };

  const merchantNameStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '0 0 10px 0'
  };

  const merchantDetailStyle = {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0',
    lineHeight: '1.6'
  };

  const detailLabelStyle = {
    fontWeight: 'bold',
    color: '#333'
  };

  const noResultsStyle = {
    textAlign: 'center',
    color: '#999',
    padding: '40px 20px',
    fontSize: '16px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Search Merchants</h1>
        <p style={subtitleStyle}>Find merchants by Pincode or Merchant ID</p>
      </div>

      <form onSubmit={handleSearch} style={formStyle}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Search By:</label>
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            style={selectStyle}
          >
            <option value="pincode">Pincode</option>
            <option value="merchantId">Merchant ID</option>
          </select>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>
            {searchType === 'pincode' ? 'Enter Pincode' : 'Enter Merchant ID'}
          </label>
          <div style={inputContainerStyle}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'pincode' ? 'e.g., 532201' : 'e.g., MER89927596'}
              style={inputStyle}
            />
            <button 
              type="submit" 
              style={buttonHover ? buttonHoverStyle : buttonStyle}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {error && <div style={errorStyle}>{error}</div>}

      {loading && <div style={loadingStyle}>🔍 Searching...</div>}

      {searched && results.length > 0 && (
        <div style={resultsContainerStyle}>
          <div style={resultsHeaderStyle}>
            Found {results.length} Merchant{results.length !== 1 ? 's' : ''}
          </div>
          
          {results.map((merchant) => (
            <div 
              key={merchant._id} 
              style={merchantCardStyle}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = merchantCardHoverStyle.boxShadow}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = merchantCardStyle.boxShadow}
            >
              <h3 style={merchantNameStyle}>{merchant.shopName}</h3>
              
              <p style={merchantDetailStyle}>
                <span style={detailLabelStyle}>Owner:</span> {merchant.ownerName}
              </p>
              
              <p style={merchantDetailStyle}>
                <span style={detailLabelStyle}>Merchant ID:</span> {merchant.merchantId}
              </p>
              
              <p style={merchantDetailStyle}>
                <span style={detailLabelStyle}>Phone:</span> {merchant.phone}
              </p>
              
              <p style={merchantDetailStyle}>
                <span style={detailLabelStyle}>Pincode:</span> {merchant.pincode}
              </p>
              
              <p style={merchantDetailStyle}>
                <span style={detailLabelStyle}>Address:</span> {merchant.shopAddress}
              </p>

              {merchant.shopCategory && (
                <p style={merchantDetailStyle}>
                  <span style={detailLabelStyle}>Category:</span> {merchant.shopCategory}
                </p>
              )}

              {merchant.shopDescription && (
                <p style={merchantDetailStyle}>
                  <span style={detailLabelStyle}>Description:</span> {merchant.shopDescription}
                </p>
              )}

              {merchant.contact?.phone && (
                <p style={merchantDetailStyle}>
                  <span style={detailLabelStyle}>Contact Phone:</span> {merchant.contact.phone}
                </p>
              )}

              {merchant.contact?.email && (
                <p style={merchantDetailStyle}>
                  <span style={detailLabelStyle}>Email:</span> {merchant.contact.email}
                </p>
              )}

              {merchant.socialMedia?.website && (
                <p style={merchantDetailStyle}>
                  <span style={detailLabelStyle}>Website:</span> {merchant.socialMedia.website}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && error && (
        <div style={noResultsStyle}>
          No merchants found. Try a different search.
        </div>
      )}
    </div>
  );
}

export default Search;
