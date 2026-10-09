import { useEffect, useMemo, useState } from "react";
import { FiActivity, FiArrowDownRight, FiArrowUpRight, FiPlus, FiSearch, FiStar, FiTarget, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog";
import styles from "./styles.module.css";

const storageKey = "northstar-watchlist";
const sampleAssets = [
    { id: 1, symbol: "NIFTYBEES", name: "Nifty 50 ETF", type: "ETF", units: 40, price: 262.4, change: 0.68, target: 280, favorite: true },
    { id: 2, symbol: "HDFCBANK", name: "HDFC Bank", type: "Stock", units: 12, price: 1780.25, change: -0.42, target: 1900, favorite: false },
    { id: 3, symbol: "TCS", name: "Tata Consultancy Services", type: "Stock", units: 4, price: 4050.8, change: 1.15, target: 4300, favorite: true },
    { id: 4, symbol: "GOLDBEES", name: "Gold ETF", type: "ETF", units: 25, price: 108.7, change: 0.22, target: 120, favorite: false },
    { id: 5, symbol: "RELIANCE", name: "Reliance Industries", type: "Stock", units: 7, price: 1480.5, change: -0.19, target: 1550, favorite: false },
];
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const readAssets = () => {
    try { const saved = localStorage.getItem(storageKey); return saved ? JSON.parse(saved) : sampleAssets; } catch { return sampleAssets; }
};

const InvestmentWatchlist = () => {
    const [assets, setAssets] = useState(readAssets);
    const [filter, setFilter] = useState("All");
    const [query, setQuery] = useState("");
    const [draft, setDraft] = useState({ symbol: "", name: "", type: "Stock", units: 1, price: "", change: "0", target: "" });
    const [pendingDelete, setPendingDelete] = useState(null);
    useEffect(() => localStorage.setItem(storageKey, JSON.stringify(assets)), [assets]);

    const listValue = assets.reduce((sum, item) => sum + item.units * item.price, 0);
    const dayMove = assets.reduce((sum, item) => sum + item.units * item.price * item.change / 100, 0);
    const averageMove = assets.length ? assets.reduce((sum, item) => sum + item.change, 0) / assets.length : 0;
    const visible = useMemo(() => assets.filter((item) => {
        const matchesFilter = filter === "All" || (filter === "Stocks" ? item.type === "Stock" : filter === "Funds" ? item.type !== "Stock" : item.favorite);
        return matchesFilter && (item.symbol + " " + item.name + " " + item.type).toLowerCase().includes(query.toLowerCase());
    }), [assets, filter, query]);
    const addAsset = (event) => {
        event.preventDefault();
        if (!draft.symbol.trim() || !draft.name.trim() || Number(draft.price) <= 0) return;
        setAssets((current) => [...current, { ...draft, id: Date.now(), symbol: draft.symbol.trim().toUpperCase(), name: draft.name.trim(), units: Math.max(1, Number(draft.units)), price: Number(draft.price), change: Number(draft.change) || 0, target: Number(draft.target) || 0, favorite: false }]);
        setDraft({ symbol: "", name: "", type: "Stock", units: 1, price: "", change: "0", target: "" });
    };
    const toggleFavorite = (id) => setAssets((current) => current.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item));
    const removeAsset = () => {
        setAssets((current) => current.filter((item) => item.id !== pendingDelete.id));
        setPendingDelete(null);
    };

    return <section className={styles.investmentWatchlist} id="workspace">
        <div className={styles.hero}><div><p className={styles.period}>YOUR PERSONAL MARKET LIST</p><h1>Keep your eye<br /><span>on the horizon.</span></h1><p className={styles.description}>A quiet place to follow the investments you care about.</p></div><div className={styles.marketBadge}><FiActivity aria-hidden="true" /><span>Sample market view</span><small>Quotes are entered by you</small></div></div>
        <div className={styles.summary}>
            <article className={styles.valueCard}><span>Tracked value</span><strong>{money(listValue)}</strong><small>Units multiplied by your saved quotes</small></article>
            <article><span>Assets watched</span><strong>{assets.length}</strong><small>Across stocks, funds, and ETFs</small></article>
            <article><span>Today's move</span><strong className={dayMove >= 0 ? styles.positive : styles.negative}>{dayMove >= 0 ? "+" : "−"}{money(Math.abs(dayMove))}</strong><small>Estimated from the daily changes below</small></article>
            <article><span>Average daily change</span><strong className={averageMove >= 0 ? styles.positive : styles.negative}>{averageMove >= 0 ? "+" : ""}{averageMove.toFixed(2)}%</strong><small>Simple average across this list</small></article>
        </div>
        <div className={styles.contentGrid}>
            <section className={styles.listPanel}>
                <div className={styles.listHeading}><div><h2>Watchlist</h2><p>Track your own quote and price target.</p></div><label className={styles.search}><FiSearch aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an asset" aria-label="Search assets" /></label></div>
                <div className={styles.filters} role="group" aria-label="Filter watchlist">{["All", "Stocks", "Funds", "Starred"].map((item) => <button key={item} type="button" className={filter === item ? styles.activeFilter : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? assets.length : item === "Stocks" ? assets.filter((asset) => asset.type === "Stock").length : item === "Funds" ? assets.filter((asset) => asset.type !== "Stock").length : assets.filter((asset) => asset.favorite).length}</span></button>)}</div>
                <div className={styles.assetList}>{visible.map((item) => {
                    const targetReached = item.target > 0 && item.price >= item.target;
                    const Icon = item.change >= 0 ? FiArrowUpRight : FiArrowDownRight;
                    return <article className={styles.assetRow} key={item.id}>
                        <button type="button" className={item.favorite ? styles.starred : styles.starButton} aria-label={(item.favorite ? "Unstar " : "Star ") + item.name} aria-pressed={item.favorite} onClick={() => toggleFavorite(item.id)}><FiStar aria-hidden="true" /></button>
                        <span className={styles.symbolMark}>{item.symbol.slice(0, 1)}</span>
                        <div className={styles.assetName}><strong>{item.symbol}</strong><span>{item.name} · {item.type}</span></div>
                        <div className={styles.units}><strong>{item.units}</strong><span>units</span></div>
                        <div className={styles.quote}><strong>{money(item.price)}</strong><span className={item.change >= 0 ? styles.positive : styles.negative}><Icon aria-hidden="true" /> {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%</span></div>
                        <div className={styles.target}><span><FiTarget aria-hidden="true" /> Target</span><strong>{item.target ? money(item.target) : "Not set"}</strong><small className={targetReached ? styles.targetReached : ""}>{targetReached ? "Target reached" : item.target ? money(item.target - item.price) + " away" : "Add a target"}</small></div>
                        <button type="button" className={styles.deleteButton} aria-label={"Remove " + item.name} onClick={() => setPendingDelete(item)}><FiTrash2 aria-hidden="true" /></button>
                    </article>;
                })}{visible.length === 0 && <p className={styles.empty}>Nothing in this view yet. Add an asset to get started.</p>}</div>
                <p className={styles.dataNote}>Sample prices are for interface demonstration only. They are not live market data or investment advice.</p>
            </section>
            <form className={styles.addPanel} id="add" onSubmit={addAsset}>
                <div className={styles.formHeading}><span className={styles.addIcon}><FiPlus aria-hidden="true" /></span><div><h2>Track an asset</h2><p>Add your own quote and target.</p></div></div>
                <div className={styles.formRow}><label>Symbol<input required maxLength="12" value={draft.symbol} onChange={(event) => setDraft({ ...draft, symbol: event.target.value })} placeholder="e.g. ABC" /></label><label>Asset type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}><option>Stock</option><option>ETF</option><option>Mutual fund</option><option>Gold</option></select></label></div>
                <label>Company or fund name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Full name" /></label>
                <div className={styles.formRow}><label>Units<input required type="number" min="1" value={draft.units} onChange={(event) => setDraft({ ...draft, units: event.target.value })} /></label><label>Last price<input required type="number" min="0.01" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="₹0.00" /></label></div>
                <div className={styles.formRow}><label>Daily change %<input type="number" step="0.01" value={draft.change} onChange={(event) => setDraft({ ...draft, change: event.target.value })} /></label><label>Target price<input type="number" min="0" step="0.01" value={draft.target} onChange={(event) => setDraft({ ...draft, target: event.target.value })} placeholder="Optional" /></label></div>
                <button className={styles.addButton} type="submit">Add to watchlist <FiPlus aria-hidden="true" /></button>
                <p className={styles.formNote}>All quotes stay on this device. Update them whenever you check your brokerage.</p>
            </form>
        </div>
        {pendingDelete && <ConfirmDialog title="Remove this asset?" description={'"' + pendingDelete.symbol + '" will be removed from your watchlist.'} confirmLabel="Remove asset" onCancel={() => setPendingDelete(null)} onConfirm={removeAsset} />}
    </section>;
};
export default InvestmentWatchlist;