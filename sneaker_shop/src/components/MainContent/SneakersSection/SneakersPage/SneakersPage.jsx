import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import style from "./SneakersPage.module.scss";
import { useState, useEffect } from "react";
import { kicksDbApi } from "../../../../api/kicksDbApi";
import Delivery from "./DeliverySection/Delivery";
import Recommended from "./RecommendedSection/Recommended";
import { NavLink } from "react-router-dom";
import classNames from "classnames";

let SneakersPage = ({ addToCart, staffPics }) => {
  const { t } = useTranslation();
  let { state } = useLocation();
  let [selectedSize, setSize] = useState(null);
  let [isItemAdded, setItemAdded] = useState(false);
  let [marketPrices, setMarketPrices] = useState(null);
  let [isLoadingMarket, setLoadingMarket] = useState(false);
  let [mainDisplayImage, setMainDisplayImage] = useState(state.image);

  const normalizeSize = (value) => {
    if (value === undefined || value === null) {
      return "";
    }

    const extracted = String(value).match(/\d+(\.\d+)?/);
    const source = extracted ? extracted[0] : value;
    const numeric = Number.parseFloat(source);
    return Number.isNaN(numeric) ? String(value) : numeric.toString();
  };

  const getPriceForSelectedSize = (variants, size) => {
    if (!Array.isArray(variants) || !size) {
      return null;
    }

    const normalizedSelectedSize = normalizeSize(size);
    const matchedVariant = variants.find((variant) => {
      if (variant?.size === undefined || variant?.size === null) {
        return false;
      }
      return normalizeSize(variant.size) === normalizedSelectedSize;
    });

    if (!matchedVariant) {
      return null;
    }

    return (
      matchedVariant.lowest_ask ??
      matchedVariant.price ??
      matchedVariant.ask ??
      matchedVariant.amount ??
      null
    );
  };

  useEffect(() => {
    setMainDisplayImage(state.image);
  }, [state.image]);
  let addToCartHandler = (state, size) => {
    let data = { ...state, size, total: 1 };
    addToCart(data);
  };

  let sizesArray = [
    "3.5",
    "4",
    "4.5",
    "5",
    "5.5",
    "6",
    "6.5",
    "7",
    "7.5",
    "8",
    "8.5",
    "9",
    "9.5",
    "10",
    "10.5",
    "11",
    "11.5",
    "12",
    "12.5",
    "13",
    "13.5",
    "14",
    "14.5",
    "15",
    "15.5",
  ];

  useEffect(() => {
    let fetchMarketData = async () => {
      setLoadingMarket(true);
      try {
        let cleanName = state.name.replace(/['"]+/g, '');
        const [stockXRes, goatRes] = await Promise.allSettled([
          kicksDbApi.getPricesFromStockX(cleanName),
          kicksDbApi.getPricesFromGOAT(cleanName)
        ]);
        
        let fetchedData = { stockx: null, goat: null, goatVariants: [] };
        if (stockXRes.status === "fulfilled" && stockXRes.value.data.data.length > 0) {
          fetchedData.stockx = stockXRes.value.data.data[0];
        }
        if (goatRes.status === "fulfilled" && goatRes.value.data.data.length > 0) {
          fetchedData.goat = goatRes.value.data.data[0];

          const goatId = fetchedData.goat?.id;
          if (goatId) {
            const goatDetailsRes = await kicksDbApi.getGOATProductById(goatId);
            fetchedData.goat = goatDetailsRes?.data?.data || fetchedData.goat;
            fetchedData.goatVariants = goatDetailsRes?.data?.data?.variants || [];
          }
        }
        setMarketPrices(fetchedData);
      } catch (error) {
        console.error("Error fetching market data", error);
      } finally {
        setLoadingMarket(false);
      }
    };
    if (state?.name) {
      fetchMarketData();
    }
  }, [state.name]);

  const selectedGoatPrice = getPriceForSelectedSize(
    marketPrices?.goatVariants,
    selectedSize
  );
  const stockxDisplayPrice =
    marketPrices?.stockx?.min_price || marketPrices?.stockx?.avg_price || "---";
  const goatDisplayPrice =
    selectedGoatPrice ??
    marketPrices?.goat?.min_price ??
    marketPrices?.goat?.avg_price ??
    "---";

  return (
    <div className={style.pageContainer}>
      <div className={style.sneakerContainer}>
        <div className={style.sneakerImage}>
          <img src={mainDisplayImage} alt={state.name} />
          
          {marketPrices?.stockx?.gallery && marketPrices.stockx.gallery.length > 0 && (
            <div className={style.thumbnailGallery}>
              <div 
                className={classNames(style.thumbnail, mainDisplayImage === state.image ? style.activeThumbnail : null)}
                onClick={() => setMainDisplayImage(state.image)}
              >
                <img src={state.image} alt="Original Thumbnail" />
              </div>
              {marketPrices.stockx.gallery.slice(0, 3).map((imgUrl, i) => (
                <div 
                  key={i} 
                  className={classNames(style.thumbnail, mainDisplayImage === imgUrl ? style.activeThumbnail : null)}
                  onClick={() => setMainDisplayImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Gallery ${i}`} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={style.sneakerInfo}>
          <h2>{state.brand}</h2>
          <h1>{state.name}</h1>
          <div className={style.price}>
            <div className={style.primaryMarketPrice}>
              <span className={style.primaryMarketLabel}>StockX</span>
              <span className={style.primaryMarketValue}>${stockxDisplayPrice}</span>
            </div>
            <div className={style.primaryMarketPrice}>
              <span className={style.primaryMarketLabel}>GOAT</span>
              <span className={style.primaryMarketValue}>${goatDisplayPrice}</span>
            </div>
          </div>

          <div className={style.marketPricesContainer}>
            <span className={style.marketPricesTitle}>Secondary Market Level</span>
            {isLoadingMarket ? (
              <div className={style.loadingText}>Fetching live market data...</div>
            ) : marketPrices ? (
              <div className={style.marketPlatforms}>
                <div className={style.platformCard}>
                  <span className={style.platformName}>StockX</span>
                  {marketPrices.stockx ? (
                    <>
                      <a href={marketPrices.stockx.link} target="_blank" rel="noreferrer" className={style.platformLink}>
                        $ {stockxDisplayPrice}
                      </a>
                      {selectedSize && (
                        <span className={style.platformSubHint}>
                          Product-level price
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={style.platformUnavailable}>N/A</span>
                  )}
                </div>
                <div className={style.platformCard}>
                  <span className={style.platformName}>GOAT</span>
                  {marketPrices.goat ? (
                    <>
                      <a href={marketPrices.goat.link} target="_blank" rel="noreferrer" className={style.platformLink}>
                        $ {goatDisplayPrice}
                      </a>
                      {selectedSize && (
                        <span className={style.platformSubHint}>
                          Size-level ask
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={style.platformUnavailable}>N/A</span>
                  )}
                </div>
              </div>
            ) : null}
            {selectedSize && (
              <div className={style.selectedSizeHint}>
                Selected size US {selectedSize}
              </div>
            )}
          </div>

          {marketPrices?.stockx && (
            <div className={style.richMetadataContainer}>
              <div className={style.specsGrid}>
                <div className={style.specItem}>
                  <span className={style.specLabel}>SKU</span>
                  <span className={style.specValue}>{marketPrices.stockx.sku || 'N/A'}</span>
                </div>
                <div className={style.specItem}>
                  <span className={style.specLabel}>Category</span>
                  <span className={style.specValue}>{marketPrices.stockx.category || 'N/A'}</span>
                </div>
                <div className={style.specItem}>
                  <span className={style.specLabel}>Weekly Demand</span>
                  <span className={style.specValue}>{marketPrices.stockx.weekly_orders || '0'}</span>
                </div>
              </div>
              {marketPrices.stockx.description && (
                <div className={style.productDescription}>
                  <h3>Original Story</h3>
                  <p dangerouslySetInnerHTML={{ __html: marketPrices.stockx.description }}></p>
                </div>
              )}
            </div>
          )}
          <span className={style.size}>{t("sneakerPage.size")} us</span>

          <div
            className={style.sizePicker}
            onChange={(e) => {
              setSize(e.target.value);
            }}
            onClick={() => {
              setItemAdded(false);
            }}
          >
            {sizesArray.map((size) => {
              let isDisabled = !state?.size.includes(+size);
              return (
                <label
                  key={size}
                  className={classNames(
                    selectedSize === size ? style.checked : null,
                    isDisabled ? style.disabled : null
                  )}
                >
                  <input
                    type="radio"
                    required={true}
                    value={size}
                    name="sizePicker"
                    disabled={isDisabled}
                  />
                  <span>{size}</span>
                </label>
              );
            })}
          </div>

          <div className={style.buttonContainer}>
            {isItemAdded ? (
              <NavLink to="/cart">
                <button className={style.goToCartButton}>
                  {t("sneakerPage.goToCart")}
                </button>
              </NavLink>
            ) : (
              <button
                className={style.buyButton}
                onClick={() => {
                  (selectedSize &&
                    (addToCartHandler(state, +selectedSize) ||
                      setItemAdded(true))) ||
                    setSize(null);
                }}
              >
                {t("sneakerPage.buy")} ${state.price}
              </button>
            )}
            {isItemAdded && (
              <span
                className={style.addedToCartSpan}
                onClick={() => {
                  setItemAdded(false);
                }}
              >
                {t("sneakerPage.addedToCart")}
              </span>
            )}
          </div>

          <Delivery />
        </div>
      </div>
      {staffPics && <Recommended staffPics={staffPics} />}
    </div>
  );
};

export default SneakersPage;
