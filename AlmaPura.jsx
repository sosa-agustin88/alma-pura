import { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
  Pencil,
  X,
  Lock,
  Shirt,
  Search,
  Settings2,
  Tag,
  ArrowLeft,
  Package,
  Percent,
  ImageUp,
  Check,
  LogOut,
} from "lucide-react";

// ---------- constants ----------

const STYLES = [
  { id: "formal", label: "Formal", color: "#8A4B32" },
  { id: "deportivo", label: "Deportivo", color: "#33513B" },
  { id: "urbano", label: "Urbano", color: "#1C1A17" },
];

const DEFAULT_CATEGORIES = ["Remera", "Jean", "Camisa", "Buzo", "Campera", "Pantalon", "Short"];

const DEFAULT_CONFIG = {
  whatsapp: "",
  paymentInfo: "",
  password: "almapura",
  brandNote: "Prendas formales, urbanas y deportivas.",
  heroImage: "",
};

const SEED_PRODUCTS = [
  { id: "p1", name: "Remera Oversize", category: "Remera", style: "urbano", price: 18000, stock: "", image: "" },
  { id: "p2", name: "Camisa Lino", category: "Camisa", style: "formal", price: 34000, stock: "", image: "" },
  { id: "p3", name: "Buzo Canguro", category: "Buzo", style: "deportivo", price: 29000, stock: "", image: "" },
  { id: "p4", name: "Jean Recto", category: "Jean", style: "urbano", price: 42000, stock: "", image: "" },
];

const money = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    Number(n) || 0
  );

const styleMeta = (id) => STYLES.find((s) => s.id === id) || STYLES[2];

async function storageGet(key, shared) {
  try {
    const res = await window.storage.get(key, shared);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}
async function storageSet(key, value, shared) {
  try {
    await window.storage.set(key, JSON.stringify(value), shared);
  } catch (e) {
    // best effort
  }
}

// ---------- small ui atoms ----------

function Pill({ active, children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={active && color ? { background: color, borderColor: color, color: "#F7F5F0" } : {}}
      className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "border-transparent"
          : "border-[#D9D2C4] text-[#5B5548] hover:border-[#1C1A17] hover:text-[#1C1A17]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs tracking-wide text-[#7A7364] mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-[#D9D2C4] bg-[#FBFAF7] px-3 py-2 text-[15px] text-[#1C1A17] placeholder-[#A9A08D] focus:outline-none focus:ring-2 focus:ring-[#33513B]/30 focus:border-[#33513B]";

// ---------- header ----------

function Header({ view, setView, cartCount, brandNote }) {
  return (
    <header className="border-b border-[#D9D2C4] bg-[#EDEAE3]/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-end justify-between gap-4">
        <button onClick={() => setView("tienda")} className="text-left">
          <div
            className="text-[26px] leading-none text-[#1C1A17]"
            style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}
          >
            Alma Pura
          </div>
          <div className="text-[12px] text-[#7A7364] mt-1">{brandNote}</div>
        </button>
        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => setView("tienda")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              view === "tienda" ? "text-[#1C1A17] font-medium" : "text-[#7A7364] hover:text-[#1C1A17]"
            }`}
          >
            Tienda
          </button>
          <button
            onClick={() => setView("carrito")}
            className={`relative px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${
              view === "carrito" ? "text-[#1C1A17] font-medium" : "text-[#7A7364] hover:text-[#1C1A17]"
            }`}
          >
            <ShoppingBag size={16} />
            Carrito
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8A4B32] text-[#F7F5F0] text-[10px] w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full grid place-items-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setView("admin")}
            title="Panel del vendedor"
            className={`p-2 rounded-md ${view === "admin" ? "text-[#1C1A17]" : "text-[#B3AB98] hover:text-[#1C1A17]"}`}
          >
            <Lock size={15} />
          </button>
        </nav>
      </div>
    </header>
  );
}

// ---------- hero / mood ----------

function Hero({ config }) {
  return (
    <div className="relative h-56 sm:h-72 overflow-hidden">
      {config.heroImage ? (
        <img src={config.heroImage} alt="Portada de la tienda" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#33513B] via-[#3F4A38] to-[#8A4B32] relative">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "repeating-linear-gradient(135deg, #F7F5F0 0 2px, transparent 2px 26px)"
          }} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17]/80 via-[#1C1A17]/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-[12px] tracking-wide text-[#E4E0D5] mb-1">Temporada verano</div>
          <div
            className="text-[28px] sm:text-[36px] text-[#F7F5F0] leading-tight max-w-md"
            style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}
          >
            Calle, color y buena onda
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- store (public) ----------

function ProductCard({ product, onAdd }) {
  const st = styleMeta(product.style);
  return (
    <div className="group border border-[#D9D2C4] bg-[#F7F5F0] rounded-md overflow-hidden flex flex-col">
      <div className="aspect-square bg-[#E4E0D5] grid place-items-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Shirt size={40} className="text-[#B3AB98]" strokeWidth={1.2} />
        )}
      </div>
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div
          className="text-[17px] text-[#1C1A17] leading-tight"
          style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}
        >
          {product.name}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#7A7364]">{product.category}</span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: st.color + "1A", color: st.color }}
          >
            {st.label}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <span className="text-[16px] font-medium text-[#1C1A17]">{money(product.price)}</span>
          <button
            onClick={() => onAdd(product)}
            className="text-sm px-3 py-1.5 rounded-md bg-[#1C1A17] text-[#F7F5F0] hover:bg-[#33513B] transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

function Tienda({ products, onAdd, config }) {
  const [query, setQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState("todos");
  const [catFilter, setCatFilter] = useState("todas");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["todas", ...Array.from(set)];
  }, [products]);

  const filtered = products.filter((p) => {
    if (styleFilter !== "todos" && p.style !== styleFilter) return false;
    if (catFilter !== "todas" && p.category !== catFilter) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <Hero config={config} />
      <div className="max-w-5xl mx-auto px-5 py-6">
        <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Pill active={styleFilter === "todos"} onClick={() => setStyleFilter("todos")}>
            Todos
          </Pill>
          {STYLES.map((s) => (
            <Pill key={s.id} active={styleFilter === s.id} color={s.color} onClick={() => setStyleFilter(s.id)}>
              {s.label}
            </Pill>
          ))}
          <span className="w-px h-5 bg-[#D9D2C4] mx-1" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="text-sm rounded-full border border-[#D9D2C4] bg-transparent px-3 py-1.5 text-[#5B5548] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "todas" ? "Toda categoria" : c}
              </option>
            ))}
          </select>
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B3AB98]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar"
              className="text-sm pl-8 pr-3 py-1.5 rounded-full border border-[#D9D2C4] bg-[#F7F5F0] focus:outline-none focus:border-[#33513B] w-40"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#7A7364]">
          No hay prendas que coincidan con esta busqueda.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

// ---------- cart ----------

function computeDiscount(subtotal, discounts) {
  const eligible = (discounts || [])
    .filter((d) => subtotal >= Number(d.minAmount))
    .sort((a, b) => Number(a.minAmount) - Number(b.minAmount));
  const best = eligible[eligible.length - 1];
  if (!best) return { rule: null, amount: 0 };
  const amount = Math.round((subtotal * Number(best.percent)) / 100);
  return { rule: best, amount };
}

function Carrito({ cart, products, setCart, config, discounts, setView }) {
  const items = cart
    .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) }))
    .filter((c) => c.product);

  const subtotal = items.reduce((sum, c) => sum + c.product.price * c.qty, 0);
  const { rule, amount: discountAmount } = computeDiscount(subtotal, discounts);
  const total = subtotal - discountAmount;

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.productId !== productId));
    } else {
      setCart(cart.map((c) => (c.productId === productId ? { ...c, qty } : c)));
    }
  };

  const whatsappHref = () => {
    const digits = (config.whatsapp || "").replace(/\D/g, "");
    const lines = items.map(
      (c) => `- ${c.product.name} x${c.qty} = ${money(c.product.price * c.qty)}`
    );
    let msg = `Hola! Quiero encargar:\n${lines.join("\n")}\n\nSubtotal: ${money(subtotal)}`;
    if (discountAmount > 0) msg += `\nDescuento (${rule.percent}%): -${money(discountAmount)}`;
    msg += `\nTotal: ${money(total)}`;
    if (config.paymentInfo) msg += `\n\nDatos de pago:\n${config.paymentInfo}`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <ShoppingBag size={30} className="mx-auto text-[#B3AB98] mb-3" strokeWidth={1.2} />
        <p className="text-[#7A7364] mb-4">Tu carrito esta vacio.</p>
        <button
          onClick={() => setView("tienda")}
          className="text-sm px-4 py-2 rounded-md bg-[#1C1A17] text-[#F7F5F0]"
        >
          Ver la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h2
        className="text-2xl text-[#1C1A17] mb-5"
        style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}
      >
        Tu pedido
      </h2>
      <div className="flex flex-col gap-3 mb-6">
        {items.map((c) => (
          <div key={c.productId} className="flex items-center gap-3 border border-[#D9D2C4] bg-[#F7F5F0] rounded-md p-3">
            <div className="w-14 h-14 rounded bg-[#E4E0D5] grid place-items-center overflow-hidden shrink-0">
              {c.product.image ? (
                <img src={c.product.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <Shirt size={20} className="text-[#B3AB98]" strokeWidth={1.2} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] text-[#1C1A17] truncate">{c.product.name}</div>
              <div className="text-[13px] text-[#7A7364]">{money(c.product.price)} c/u</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(c.productId, c.qty - 1)}
                className="w-7 h-7 rounded-full border border-[#D9D2C4] grid place-items-center text-[#5B5548] hover:border-[#1C1A17]"
              >
                <Minus size={13} />
              </button>
              <span className="w-5 text-center text-[15px]">{c.qty}</span>
              <button
                onClick={() => updateQty(c.productId, c.qty + 1)}
                className="w-7 h-7 rounded-full border border-[#D9D2C4] grid place-items-center text-[#5B5548] hover:border-[#1C1A17]"
              >
                <Plus size={13} />
              </button>
            </div>
            <div className="w-20 text-right text-[15px] text-[#1C1A17]">{money(c.product.price * c.qty)}</div>
            <button
              onClick={() => updateQty(c.productId, 0)}
              className="text-[#B3AB98] hover:text-[#8A4B32] ml-1"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="border border-[#D9D2C4] bg-[#F7F5F0] rounded-md p-4 flex flex-col gap-1.5 mb-4">
        <div className="flex justify-between text-[14px] text-[#5B5548]">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-[14px] text-[#33513B]">
            <span>Descuento ({rule.percent}% desde {money(rule.minAmount)})</span>
            <span>-{money(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[19px] text-[#1C1A17] pt-1.5 mt-1 border-t border-[#D9D2C4]">
          <span style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}>Total</span>
          <span style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}>{money(total)}</span>
        </div>
      </div>

      {config.paymentInfo && (
        <div className="border border-[#D9D2C4] rounded-md p-4 mb-4 text-[13px] text-[#5B5548] whitespace-pre-wrap">
          <span className="block text-[12px] text-[#7A7364] mb-1">Datos de pago</span>
          {config.paymentInfo}
        </div>
      )}

      {config.whatsapp ? (
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-[#33513B] text-[#F7F5F0] hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={17} />
          Confirmar pedido por WhatsApp
        </a>
      ) : (
        <div className="text-[13px] text-[#8A4B32] text-center">
          El vendedor todavia no configuro un numero de WhatsApp.
        </div>
      )}
    </div>
  );
}

// ---------- admin ----------

function AdminLogin({ config, onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  return (
    <div className="max-w-sm mx-auto px-5 py-24">
      <div className="border border-[#D9D2C4] bg-[#F7F5F0] rounded-md p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[#1C1A17]">
          <Lock size={16} />
          <span className="text-[16px]" style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}>
            Panel del vendedor
          </span>
        </div>
        <Field label="Contraseña">
          <input
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && onLogin(pw, setError)}
            className={inputCls}
            autoFocus
          />
        </Field>
        {error && <div className="text-[13px] text-[#8A4B32]">Contraseña incorrecta.</div>}
        <button
          onClick={() => onLogin(pw, setError)}
          className="py-2 rounded-md bg-[#1C1A17] text-[#F7F5F0] text-sm hover:bg-[#33513B]"
        >
          Entrar
        </button>
        <div className="text-[11px] text-[#B3AB98]">
          Contraseña inicial: <span className="font-mono">almapura</span> (cambiala en Configuracion).
        </div>
      </div>
    </div>
  );
}

const emptyProduct = { name: "", category: "", style: "urbano", price: "", stock: "", image: "" };

function ProductForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyProduct);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const canSave = form.name.trim() && form.category.trim() && String(form.price).trim();

  return (
    <div className="border border-[#D9D2C4] bg-[#F7F5F0] rounded-md p-4 flex flex-col gap-3 mb-5">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Nombre">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            placeholder="Remera Oversize"
          />
        </Field>
        <Field label="Precio">
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={inputCls}
            placeholder="18000"
          />
        </Field>
        <Field label="Categoria">
          <input
            list="categorias"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputCls}
            placeholder="Remera, Jean, Campera..."
          />
          <datalist id="categorias">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Estilo">
          <select
            value={form.style}
            onChange={(e) => setForm({ ...form, style: e.target.value })}
            className={inputCls}
          >
            {STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Stock (opcional)">
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className={inputCls}
            placeholder="Dejar vacio si no lleva control"
          />
        </Field>
        <Field label="Imagen">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-[#D9D2C4] hover:border-[#1C1A17] text-[#5B5548]"
            >
              <ImageUp size={14} />
              {form.image ? "Cambiar foto" : "Subir foto"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {form.image && (
              <img src={form.image} alt="" className="w-9 h-9 rounded object-cover border border-[#D9D2C4]" />
            )}
          </div>
        </Field>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded-md text-[#7A7364] hover:text-[#1C1A17]">
          Cancelar
        </button>
        <button
          disabled={!canSave}
          onClick={() => canSave && onSave(form)}
          className="text-sm px-4 py-1.5 rounded-md bg-[#1C1A17] text-[#F7F5F0] disabled:opacity-40"
        >
          Guardar prenda
        </button>
      </div>
    </div>
  );
}

function AdminProductos({ products, setProducts }) {
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const categories = useMemo(
    () => Array.from(new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category)])),
    [products]
  );

  const save = (form) => {
    const clean = { ...form, price: Number(form.price) || 0, stock: form.stock === "" ? "" : Number(form.stock) };
    if (editing === "new") {
      setProducts([...products, { ...clean, id: "p" + Date.now() }]);
    } else {
      setProducts(products.map((p) => (p.id === editing.id ? { ...clean, id: p.id } : p)));
    }
    setEditing(null);
  };

  const remove = (id) => {
    if (window.confirm("Eliminar esta prenda?")) setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] text-[#1C1A17] font-medium">Prendas ({products.length})</h3>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-[#1C1A17] text-[#F7F5F0]"
          >
            <Plus size={14} />
            Nueva prenda
          </button>
        )}
      </div>

      {editing !== null && (
        <ProductForm
          initial={editing === "new" ? null : editing}
          categories={categories}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="flex flex-col gap-2">
        {products.map((p) => {
          const st = styleMeta(p.style);
          return (
            <div key={p.id} className="flex items-center gap-3 border border-[#D9D2C4] bg-[#F7F5F0] rounded-md p-2.5">
              <div className="w-11 h-11 rounded bg-[#E4E0D5] grid place-items-center overflow-hidden shrink-0">
                {p.image ? (
                  <img src={p.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Shirt size={16} className="text-[#B3AB98]" strokeWidth={1.2} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-[#1C1A17] truncate">{p.name}</div>
                <div className="text-[12px] text-[#7A7364] flex items-center gap-1.5">
                  {p.category}
                  <span className="w-1 h-1 rounded-full bg-[#D9D2C4]" />
                  <span style={{ color: st.color }}>{st.label}</span>
                  {p.stock !== "" && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[#D9D2C4]" />
                      stock {p.stock}
                    </>
                  )}
                </div>
              </div>
              <div className="text-[14px] text-[#1C1A17]">{money(p.price)}</div>
              <button onClick={() => setEditing(p)} className="text-[#7A7364] hover:text-[#1C1A17] p-1">
                <Pencil size={14} />
              </button>
              <button onClick={() => remove(p.id)} className="text-[#7A7364] hover:text-[#8A4B32] p-1">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDescuentos({ discounts, setDiscounts }) {
  const [form, setForm] = useState({ minAmount: "", percent: "" });

  const add = () => {
    if (!form.minAmount || !form.percent) return;
    setDiscounts(
      [...discounts, { id: "d" + Date.now(), minAmount: Number(form.minAmount), percent: Number(form.percent) }].sort(
        (a, b) => a.minAmount - b.minAmount
      )
    );
    setForm({ minAmount: "", percent: "" });
  };

  const remove = (id) => setDiscounts(discounts.filter((d) => d.id !== id));

  return (
    <div>
      <h3 className="text-[15px] text-[#1C1A17] font-medium mb-1">Descuentos por monto</h3>
      <p className="text-[13px] text-[#7A7364] mb-4">
        Se aplica el escalon mas alto que el total del carrito supere. Por ejemplo: 10% desde $50.000 y 15% desde
        $90.000.
      </p>

      <div className="border border-[#D9D2C4] bg-[#F7F5F0] rounded-md p-4 flex flex-col sm:flex-row gap-3 items-end mb-5">
        <Field label="Monto minimo">
          <input
            type="number"
            value={form.minAmount}
            onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
            className={inputCls}
            placeholder="50000"
          />
        </Field>
        <Field label="Descuento %">
          <input
            type="number"
            value={form.percent}
            onChange={(e) => setForm({ ...form, percent: e.target.value })}
            className={inputCls}
            placeholder="10"
          />
        </Field>
        <button onClick={add} className="text-sm px-4 py-2 rounded-md bg-[#1C1A17] text-[#F7F5F0] whitespace-nowrap">
          Agregar
        </button>
      </div>

      {discounts.length === 0 ? (
        <p className="text-[13px] text-[#B3AB98]">Todavia no hay descuentos configurados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {discounts.map((d) => (
            <div key={d.id} className="flex items-center gap-3 border border-[#D9D2C4] bg-[#F7F5F0] rounded-md p-3">
              <Percent size={15} className="text-[#33513B]" />
              <span className="text-[14px] text-[#1C1A17]">
                {d.percent}% desde {money(d.minAmount)}
              </span>
              <button onClick={() => remove(d.id)} className="ml-auto text-[#7A7364] hover:text-[#8A4B32] p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminConfig({ config, setConfig }) {
  const [form, setForm] = useState(config);
  const [newPw, setNewPw] = useState("");
  const [saved, setSaved] = useState(false);
  const heroFileRef = useRef(null);

  const handleHeroFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, heroImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    const next = { ...form, password: newPw.trim() ? newPw.trim() : form.password };
    setConfig(next);
    setNewPw("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="max-w-md flex flex-col gap-4">
      <Field label="Foto de portada (se muestra arriba de la tienda)">
        <div className="flex items-center gap-2">
          <button
            onClick={() => heroFileRef.current?.click()}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-[#D9D2C4] hover:border-[#1C1A17] text-[#5B5548]"
          >
            <ImageUp size={14} />
            {form.heroImage ? "Cambiar foto" : "Subir foto"}
          </button>
          <input ref={heroFileRef} type="file" accept="image/*" onChange={handleHeroFile} className="hidden" />
          {form.heroImage && (
            <>
              <img src={form.heroImage} alt="" className="w-9 h-9 rounded object-cover border border-[#D9D2C4]" />
              <button
                onClick={() => setForm({ ...form, heroImage: "" })}
                className="text-[12px] text-[#7A7364] hover:text-[#8A4B32]"
              >
                Quitar
              </button>
            </>
          )}
        </div>
        <span className="block text-[11px] text-[#B3AB98] mt-1">
          Si no subis ninguna, se muestra un fondo de color en su lugar.
        </span>
      </Field>
      <Field label="Numero de WhatsApp (con codigo de pais, solo numeros)">
        <input
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          className={inputCls}
          placeholder="5493700000000"
        />
      </Field>
      <Field label="Datos de pago (se muestran en el carrito y en el mensaje de WhatsApp)">
        <textarea
          value={form.paymentInfo}
          onChange={(e) => setForm({ ...form, paymentInfo: e.target.value })}
          className={inputCls + " min-h-[90px]"}
          placeholder={"Alias: alma.pura.mp\nTransferencia o efectivo contra entrega"}
        />
      </Field>
      <Field label="Bajada debajo del nombre de la marca">
        <input
          value={form.brandNote}
          onChange={(e) => setForm({ ...form, brandNote: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Nueva contraseña del panel (dejar vacio para no cambiarla)">
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className={inputCls}
          placeholder="••••••••"
        />
      </Field>
      <button
        onClick={save}
        className="flex items-center justify-center gap-1.5 py-2 rounded-md bg-[#1C1A17] text-[#F7F5F0] text-sm hover:bg-[#33513B] w-fit px-5"
      >
        {saved ? <Check size={14} /> : null}
        {saved ? "Guardado" : "Guardar cambios"}
      </button>
    </div>
  );
}

function Admin({ config, setConfig, products, setProducts, discounts, setDiscounts, isAdmin, setIsAdmin }) {
  const [tab, setTab] = useState("productos");
  const [error, setError] = useState(false);

  const login = (pw) => {
    if (pw === config.password) setIsAdmin(true);
    else setError(true);
  };

  if (!isAdmin) return <AdminLogin config={config} onLogin={login} />;

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-[#1C1A17]" style={{ fontFamily: "Georgia, 'Iowan Old Style', serif" }}>
          Panel del vendedor
        </h2>
        <button
          onClick={() => setIsAdmin(false)}
          className="flex items-center gap-1.5 text-[13px] text-[#7A7364] hover:text-[#8A4B32]"
        >
          <LogOut size={14} />
          Salir
        </button>
      </div>
      <div className="flex gap-1 border-b border-[#D9D2C4] mb-6">
        {[
          { id: "productos", label: "Prendas", icon: Package },
          { id: "descuentos", label: "Descuentos", icon: Percent },
          { id: "config", label: "Configuracion", icon: Settings2 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm border-b-2 -mb-px ${
              tab === t.id
                ? "border-[#1C1A17] text-[#1C1A17]"
                : "border-transparent text-[#7A7364] hover:text-[#1C1A17]"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>
      {tab === "productos" && <AdminProductos products={products} setProducts={setProducts} />}
      {tab === "descuentos" && <AdminDescuentos discounts={discounts} setDiscounts={setDiscounts} />}
      {tab === "config" && <AdminConfig config={config} setConfig={setConfig} />}
    </div>
  );
}

// ---------- app ----------

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("tienda");
  const [products, setProductsState] = useState([]);
  const [config, setConfigState] = useState(DEFAULT_CONFIG);
  const [discounts, setDiscountsState] = useState([]);
  const [cart, setCartState] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, c, d, cart0] = await Promise.all([
        storageGet("ap_products", true),
        storageGet("ap_config", true),
        storageGet("ap_discounts", true),
        storageGet("ap_cart", false),
      ]);
      if (p) setProductsState(p);
      else {
        setProductsState(SEED_PRODUCTS);
        storageSet("ap_products", SEED_PRODUCTS, true);
      }
      if (c) setConfigState({ ...DEFAULT_CONFIG, ...c });
      else storageSet("ap_config", DEFAULT_CONFIG, true);
      if (d) setDiscountsState(d);
      if (cart0) setCartState(cart0);
      setReady(true);
    })();
  }, []);

  const setProducts = (next) => {
    setProductsState(next);
    storageSet("ap_products", next, true);
  };
  const setConfig = (next) => {
    setConfigState(next);
    storageSet("ap_config", next, true);
  };
  const setDiscounts = (next) => {
    setDiscountsState(next);
    storageSet("ap_discounts", next, true);
  };
  const setCart = (next) => {
    setCartState(next);
    storageSet("ap_cart", next, false);
  };

  const addToCart = (product) => {
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      setCart(cart.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { productId: product.id, qty: 1 }]);
    }
  };

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  if (!ready) {
    return <div className="min-h-screen bg-[#EDEAE3] grid place-items-center text-[#7A7364] text-sm">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#EDEAE3]" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Header view={view} setView={setView} cartCount={cartCount} brandNote={config.brandNote} />
      {view === "tienda" && <Tienda products={products} onAdd={addToCart} config={config} />}
      {view === "carrito" && (
        <Carrito cart={cart} products={products} setCart={setCart} config={config} discounts={discounts} setView={setView} />
      )}
      {view === "admin" && (
        <Admin
          config={config}
          setConfig={setConfig}
          products={products}
          setProducts={setProducts}
          discounts={discounts}
          setDiscounts={setDiscounts}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
        />
      )}
      <footer className="max-w-5xl mx-auto px-5 py-8 text-[11px] text-[#B3AB98] flex items-center gap-1.5">
        <Tag size={11} />
        Alma Pura
      </footer>
    </div>
  );
}
