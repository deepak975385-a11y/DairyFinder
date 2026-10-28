import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import AdminPanel from "./admin/AdminPanel";

const API_URL = "http://localhost:5001";


const defaultMarkerIcon = L.divIcon({
  className: "custom-map-marker",
  html: '<div class="map-marker-pin">📍</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  const [dairies, setDairies] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingDairies, setLoadingDairies] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [selectedDairy, setSelectedDairy] = useState(null);

  const [searchArea, setSearchArea] = useState("");
  const [searchedArea, setSearchedArea] = useState("");
  const [searchMode, setSearchMode] = useState("text");
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [reservation, setReservation] = useState(null);
  const [reservationHistory, setReservationHistory] = useState([]);

  const [message, setMessage] = useState("");
  const [quantities, setQuantities] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // =========================================================
  // LOAD DAIRIES
  // =========================================================

  const loadDairies = async () => {
    try {
      setLoadingDairies(true);
      setMessage("");

      const response = await fetch(`${API_URL}/api/dairies`);

      if (!response.ok) {
        throw new Error("Failed to load dairies");
      }

      const data = await response.json();
      setDairies(data);
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to load dairies. Please check the backend."
      );
    } finally {
      setLoadingDairies(false);
    }
  };

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async (dairyId) => {
    try {
      setLoadingProducts(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/dairies/${dairyId}/products`
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      setProducts(data);

      const initialQuantities = {};

      data.forEach((product) => {
        initialQuantities[product.id] =
          product.quantity > 0 ? 1 : 0;
      });

      setQuantities(initialQuantities);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDairies();
  }, []);

  // =========================================================
  // RESERVATION TIMER
  // =========================================================

  useEffect(() => {
    if (!reservation?.expiresAt) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(reservation.expiresAt).getTime() -
            Date.now()) /
            1000
        )
      );

      setTimeLeft(remaining);
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [reservation]);

  // =========================================================
  // FORMAT TIMER
  // =========================================================

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // =========================================================
  // LOCATION SEARCH
  // =========================================================

  const runNearbySearch = async (lat, lng, label) => {
    try {
      setLocationLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/dairies/nearby?lat=${lat}&lng=${lng}`
      );

      if (!response.ok) {
        throw new Error("Nearby dairy search failed");
      }

      const data = await response.json();

      setDairies(data);
      setLocationCoords({ lat, lng });
      setSearchedArea(label);
      setSearchArea(label);
      setSelectedDairy(null);
      setProducts([]);
      setReservation(null);
      setShowMap(false);

      setTimeout(() => {
        document.getElementById("dairies")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error(error);
      setMessage("Unable to find nearby dairies. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location services.");
      return;
    }

    setLocationLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        runNearbySearch(
          position.coords.latitude,
          position.coords.longitude,
          "Your current location"
        );
      },
      (error) => {
        console.error(error);
        setLocationLoading(false);
        setMessage(
          "Location permission was not available. You can enter a location or select one on the map."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleTextLocation = async () => {
    const value = searchArea.trim();

    if (!value) {
      setMessage("Please enter a location.");
      return;
    }

    try {
      setLocationLoading(true);
      setMessage("");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          value + ", Indore, Madhya Pradesh, India"
        )}`
      );

      if (!response.ok) {
        throw new Error("Location lookup failed");
      }

      const results = await response.json();

      if (!results.length) {
        setMessage("Location not found. Try a nearby area or full address.");
        return;
      }

      const result = results[0];

      await runNearbySearch(
        Number(result.lat),
        Number(result.lon),
        result.display_name.split(",").slice(0, 2).join(",")
      );
    } catch (error) {
      console.error(error);
      setMessage("Unable to find that location right now.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapLocation = (lat, lng) => {
    runNearbySearch(lat, lng, "Selected map location");
  };

  const clearSearch = () => {
    setSearchArea("");
    setSearchedArea("");
    setLocationCoords(null);
    setShowMap(false);
    loadDairies();
  };

  // =========================================================
  // DEFAULT DAIRIES
  // =========================================================

  const displayedDairies = dairies;

  // =========================================================
  // VIEW PRODUCTS
  // =========================================================

  const viewProducts = (dairy) => {
    setSelectedDairy(dairy);
    setReservation(null);
    setMessage("");

    loadProducts(dairy.id);

    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 150);
  };

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  const increaseQuantity = (product) => {
    const currentQuantity = quantities[product.id] || 1;

    if (currentQuantity < product.quantity) {
      setQuantities((previous) => ({
        ...previous,
        [product.id]: currentQuantity + 1,
      }));
    }
  };

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  const decreaseQuantity = (product) => {
    const currentQuantity = quantities[product.id] || 1;

    if (currentQuantity > 1) {
      setQuantities((previous) => ({
        ...previous,
        [product.id]: currentQuantity - 1,
      }));
    }
  };

  // =========================================================
  // RESERVE PRODUCT
  // =========================================================

  const reserveProduct = async (productId) => {
    if (!selectedDairy) {
      return;
    }

    try {
      setMessage("");

      const selectedQuantity = quantities[productId] || 1;

      const response = await fetch(`${API_URL}/api/reserve`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          dairyId: selectedDairy.id,
          productId: productId,
          quantity: selectedQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Reservation failed.");
        return;
      }

      setReservation(data);

      setReservationHistory((previous) => [
        data,
        ...previous,
      ]);

      await loadProducts(selectedDairy.id);

      setTimeout(() => {
        document.getElementById("reservation")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 150);
    } catch (error) {
      console.error(error);

      setMessage(
        "Server error. Please make sure the backend is running."
      );
    }
  };

  // =========================================================
  // PRODUCT ICON
  // =========================================================

  const getProductIcon = (name) => {
    const icons = {
      Milk: "🥛",
      Curd: "🥣",
      Butter: "🧈",
      Ghee: "🫙",
      Paneer: "🧀",
      Chaas: "🍶",
      Lassi: "🥛",
      Khoya: "🍨",
    };

    return icons[name] || "🥛";
  };

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (quantity) => {
    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        className: "stock-out",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        className: "stock-low",
      };
    }

    return {
      label: "In Stock",
      className: "stock-good",
    };
  };

  // =========================================================
  // ADMIN PANEL
  // =========================================================

  if (isAdmin) {
    return (
      <AdminPanel
        onBack={() => {
          setIsAdmin(false);
        }}
      />
    );
  }

  // =========================================================
  // CUSTOMER PANEL
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar">

        <a href="#home" className="logo">
          <span className="logo-icon">🥛</span>

          <span>
            Dairy <strong>Finder</strong>
          </span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#dairies">Dairies</a>
          <a href="#products">Products</a>
          <a href="#reservation">Reservation</a>
          <a href="#history">History</a>

          <button
            className="admin-access-btn"
            onClick={() => setIsAdmin(true)}
          >
            Admin
          </button>
        </div>

      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            <span>●</span> Fresh products. Nearby dairies.
          </div>

          <h1>
            Find Fresh Dairy
            <br />
            <span>Products Near You</span>
          </h1>

          <p>
            Discover nearby dairies, check real-time product
            availability and reserve your favourite dairy
            products before you visit.
          </p>

          <div className="location-search">

            <div className="search-box">

              <div className="search-icon">
                🔎
              </div>

              <input
                type="text"
                placeholder="Enter area, locality or address..."
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTextLocation();
                  }
                }}
              />

              <button
                onClick={handleTextLocation}
                disabled={locationLoading}
              >
                {locationLoading ? "Finding..." : "Search"}
              </button>

            </div>

            <div className="location-actions">

              <button
                className="location-action"
                onClick={handleCurrentLocation}
                disabled={locationLoading}
              >
                📍 Use Current Location
              </button>

              <button
                className="location-action"
                onClick={() => setShowMap((previous) => !previous)}
              >
                🗺️ {showMap ? "Close Map" : "Select on Map"}
              </button>

            </div>

            {showMap && (
              <div className="map-picker">
                <MapContainer
                  center={[22.7196, 75.8577]}
                  zoom={12}
                  scrollWheelZoom={true}
                  className="location-map"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler onSelect={handleMapLocation} />

                  {locationCoords && (
                    <Marker
                      position={[locationCoords.lat, locationCoords.lng]}
                      icon={defaultMarkerIcon}
                    />
                  )}
                </MapContainer>

                <p className="map-help">
                  Click anywhere on the map to find dairies near that location.
                </p>
              </div>
            )}

          </div>

          <div className="hero-features">

            <span>✓ Real-time availability</span>
            <span>✓ Easy reservation</span>
            <span>✓ Nearby dairies</span>

          </div>

        </div>

      </section>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div className="message">
          <span>⚠️</span>
          {message}
        </div>
      )}

      {/* =====================================================
          SEARCH RESULT
      ===================================================== */}

      {searchedArea && (
        <section className="search-result">

          <div>
            <span className="result-label">
              SEARCH RESULTS
            </span>

            <h3>
              Dairies near "{searchedArea}"
            </h3>
          </div>

          <button
            onClick={() => {
              clearSearch();
            }}
          >
            Clear Search
          </button>

        </section>
      )}

      {/* =====================================================
          DAIRIES
      ===================================================== */}

      <section
        className="section"
        id="dairies"
      >

        <div className="section-heading">

          <div className="section-kicker">
            <span>01</span>
            Nearby dairies
          </div>

          <h2>
            Choose Your <span>Dairy</span>
          </h2>

          <p>
            Find a nearby dairy and explore its
            currently available products.
          </p>

        </div>

        {loadingDairies ? (

          <div className="loading">
            <div className="loading-circle"></div>
            <p>Finding nearby dairies...</p>
          </div>

        ) : displayedDairies.length === 0 ? (

          <div className="empty">

            <div className="empty-icon">
              🔎
            </div>

            <h3>
              No dairies found
            </h3>

            <p>
              Try searching for another area or dairy name.
            </p>

          </div>

        ) : (

          <div className="dairy-grid">

            {displayedDairies.map((dairy) => (

              <div
                className="dairy-card"
                key={dairy.id}
              >

                <div className="dairy-card-top">

                  <div className="dairy-icon">
                    🏪
                  </div>

                  <span className="distance-badge">
                    📍 {dairy.distance}
                  </span>

                </div>

                <h3>
                  {dairy.name}
                </h3>

                <p className="dairy-area">
                  {dairy.area}
                </p>

                <div className="dairy-info">

                  <span>
                    📍 {dairy.address}
                  </span>

                  <span>
                    📞 {dairy.phone}
                  </span>

                </div>

                <button
                  className="dairy-button"
                  onClick={() => viewProducts(dairy)}
                >
                  <span>Explore Products</span>
                  <span>→</span>
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* =====================================================
          SELECTED DAIRY
      ===================================================== */}

      {selectedDairy && (

        <section className="selected-dairy">

          <div className="selected-dairy-icon">
            🏪
          </div>

          <div className="selected-dairy-content">

            <span>
              Currently viewing
            </span>

            <h2>
              {selectedDairy.name}
            </h2>

            <p>
              📍 {selectedDairy.area}
              <span>•</span>
              🚗 {selectedDairy.distance}
            </p>

          </div>

          <button
            onClick={() => {
              setSelectedDairy(null);
              setProducts([]);
            }}
          >
            Change Dairy
          </button>

        </section>

      )}

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {selectedDairy && (

        <section
          className="section products-section"
          id="products"
        >

          <div className="section-heading">

            <div className="section-kicker">
              <span>02</span>
              Fresh dairy products
            </div>

            <h2>
              What's <span>Available?</span>
            </h2>

            <p>
              Check live stock, choose your quantity
              and reserve before visiting.
            </p>

          </div>

          {loadingProducts ? (

            <div className="loading">

              <div className="loading-circle"></div>

              <p>
                Checking product availability...
              </p>

            </div>

          ) : products.length === 0 ? (

            <div className="empty">

              <div className="empty-icon">
                🥛
              </div>

              <h3>
                No products available
              </h3>

              <p>
                This dairy currently has no products listed.
              </p>

            </div>

          ) : (

            <div className="product-box">

              {products.map((product) => {

                const selectedQuantity =
                  quantities[product.id] || 1;

                const totalPrice =
                  selectedQuantity * product.price;

                const stockStatus =
                  getStockStatus(product.quantity);

                return (

                  <div
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-card-top">

                      <div className="product-icon">
                        {getProductIcon(product.name)}
                      </div>

                      <span
                        className={`stock-badge ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>

                    </div>

                    <h4>
                      {product.name}
                    </h4>

                    <p className="product-stock">

                      {product.quantity > 0 ? (
                        <>
                          <strong>
                            {product.quantity}
                          </strong>{" "}
                          {product.unit} available
                        </>
                      ) : (
                        "Currently unavailable"
                      )}

                    </p>

                    <div className="product-price">
                      ₹{product.price}
                      <span>
                        / {product.unit}
                      </span>
                    </div>

                    {/* QUANTITY */}

                    {product.quantity > 0 && (
                      <div className="quantity-wrapper">

                        <span className="quantity-title">
                          Quantity
                        </span>

                        <div className="quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(product)
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span>
                            {selectedQuantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(product)
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>

                        </div>

                        <div className="total-price">
                          Total{" "}
                          <strong>
                            ₹{totalPrice}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="reserve-button"
                          onClick={() =>
                            reserveProduct(product.id)
                          }
                        >
                          Reserve Now
                          <span>→</span>
                        </button>

                      </div>
                    )}

                    {product.quantity <= 0 && (

                      <button
                        type="button"
                        className="out-of-stock-button"
                        disabled
                      >
                        Currently Unavailable
                      </button>

                    )}

                  </div>

                );
              })}

            </div>

          )}

        </section>

      )}

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      {reservation && (

        <section
          className="reservation-section"
          id="reservation"
        >

          <div className="reservation-card">

            <div className="reservation-success">

              <div className="reservation-icon">
                ✓
              </div>

              <span>
                Reservation Successful
              </span>

            </div>

            <h2>
              Your Reservation is Confirmed
            </h2>

            <p className="reservation-subtitle">
              Keep your reservation ID and collect
              your product before the timer expires.
            </p>

            <div className="reservation-id-box">

              <span>
                Reservation ID
              </span>

              <strong>
                {reservation.id}
              </strong>

            </div>

            <div className="reservation-details">

              <div className="reservation-detail">
                <span>DAIRY</span>
                <strong>
                  {reservation.dairy}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>PRODUCT</span>
                <strong>
                  {reservation.product}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>QUANTITY</span>
                <strong>
                  {reservation.quantity}{" "}
                  {reservation.unit}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>PRICE / UNIT</span>
                <strong>
                  ₹{reservation.price}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>TOTAL</span>
                <strong className="reservation-total">
                  ₹
                  {reservation.totalPrice ??
                    reservation.price *
                      reservation.quantity}
                </strong>
              </div>

            </div>

            <div className="reservation-timer-box">

              <div className="timer-text">
                <span>⏳</span>

                <div>
                  <small>
                    Reservation valid for
                  </small>

                  <strong>
                    10 minutes
                  </strong>
                </div>
              </div>

              {timeLeft > 0 ? (

                <div className="timer">
                  {formatTime(timeLeft)}
                </div>

              ) : (

                <div className="reservation-expired">
                  Expired
                </div>

              )}

            </div>

            {timeLeft > 0 ? (

              <p className="notice">
                📍 Please collect your reserved product
                from the dairy before the timer expires.
              </p>

            ) : (

              <p className="notice expired-notice">
                ⏰ This reservation has expired.
              </p>

            )}

          </div>

        </section>

      )}

      {/* =====================================================
          HISTORY
      ===================================================== */}

      {reservationHistory.length > 0 && (

        <section
          className="section reservation-history"
          id="history"
        >

          <div className="section-heading">

            <div className="section-kicker">
              <span>03</span>
              Your activity
            </div>

            <h2>
              Reservation <span>History</span>
            </h2>

            <p>
              Your recent dairy product reservations.
            </p>

          </div>

          <div className="history-list">

            {reservationHistory.map(
              (item, index) => (

                <div
                  className="history-card"
                  key={`${item.id}-${index}`}
                >

                  <div className="history-icon">
                    {getProductIcon(item.product)}
                  </div>

                  <div className="history-info">

                    <div className="history-title-row">

                      <h3>
                        {item.product}
                      </h3>

                      <span className="history-status">
                        Reserved
                      </span>

                    </div>

                    <p>
                      🏪 {item.dairy}
                    </p>

                    <p>
                      📦 {item.quantity}{" "}
                      {item.unit}
                    </p>

                  </div>

                  <div className="history-price">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {item.totalPrice ??
                        item.price *
                          item.quantity}
                    </strong>

                    <small>
                      {item.id}
                    </small>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="footer-brand">
          <span>🥛</span>

          <strong>
            Dairy Finder
          </strong>
        </div>

        <p>
          Find nearby dairies. Check live availability.
          Reserve fresh dairy products.
        </p>

        <div className="footer-line"></div>

        <small>
          © 2026 Dairy Finder · Built for a better
          local dairy experience.
        </small>

      </footer>

    </div>
  );
}

export default App;