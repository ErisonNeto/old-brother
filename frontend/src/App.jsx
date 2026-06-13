import React, { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
const STORE_WHATSAPP = String(import.meta.env.VITE_STORE_WHATSAPP || '5591982358630').replace(/\D/g, '')
const DEFAULT_DELIVERY_FEE = Number(import.meta.env.VITE_DEFAULT_DELIVERY_FEE || 0)
const POLL_MS = 2500
const roles = ['admin', 'gerente', 'garcom', 'cozinha', 'caixa', 'delivery', 'estoque']
const roleLabels = { admin: 'Admin', gerente: 'Gerente', garcom: 'Garçom', cozinha: 'Cozinha', caixa: 'Caixa', delivery: 'Delivery', estoque: 'Estoque' }
const origins = ['mesa', 'delivery', 'retirada', 'balcao', 'whatsapp']
const orderStatuses = ['novo', 'preparo', 'pronto', 'aguardando_pagamento', 'saiu_entrega', 'entregue', 'finalizado', 'cancelado']
const payMethods = [
  { label: 'Pix', value: 'pix' },
  { label: 'Débito', value: 'debito' },
  { label: 'Crédito', value: 'credito' },
  { label: 'Dinheiro', value: 'dinheiro' },
  { label: 'Misto', value: 'misto' }
]
const periodOptions = [
  { value: 'daily', label: 'Diário', kpi: 'Faturamento diário' },
  { value: 'weekly', label: 'Semanal', kpi: 'Faturamento semanal' },
  { value: 'monthly', label: 'Mensal', kpi: 'Faturamento mensal' },
  { value: 'total', label: 'Total', kpi: 'Faturamento total' },
]

const OLD_BROTHER_WHATSAPP_DISPLAY = '+55 91 98235-8630'
const OLD_BROTHER_MENU_PRODUCTS = [
  {
    id: 'ob-promo-namorados-95',
    name: 'Combo Dia dos Namorados',
    category: 'Promoções',
    price: 95.90,
    description: '1 milkshake de morango, 1 milkshake de Ovomaltine, 1 batata G, 1 refrigerante 600ml e 2 hambúrgueres especiais.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-promo-namorados-65',
    name: 'Combo Especial Dia dos Namorados',
    category: 'Promoções',
    price: 65.90,
    description: '2 hambúrgueres, batata G e 1 refrigerante 600ml para compartilhar.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-costela-old',
    name: 'Costela Old',
    category: 'Hambúrgueres',
    price: 28,
    description: 'Pão australiano, carne 150g, queijo prato, costela desfiada, geleia de pimenta e molho da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-duplo-old-bacon',
    name: 'Duplo Old Bacon',
    category: 'Hambúrgueres',
    price: 35,
    description: 'Pão australiano, 2 carnes 150g, 2 queijos cheddar, bacon, creme de cheddar e molho da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-salad-old-burguer',
    name: 'Salad Old Burguer',
    category: 'Hambúrgueres',
    price: 20,
    description: 'Pão australiano, carne 150g, queijo prato, salada e molho da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-classic-old-burguer',
    name: 'Classic Old Burguer',
    category: 'Hambúrgueres',
    price: 22,
    description: 'Pão australiano, carne 150g, queijo cheddar, pickles e molho da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-cheddar-old-burguer',
    name: 'Cheddar Old Burguer',
    category: 'Hambúrgueres',
    price: 22,
    description: 'Pão australiano, carne 150g, queijo cheddar, cebola caramelizada e molho da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-old-brother-burguer',
    name: 'Old Brother Burguer',
    category: 'Hambúrgueres',
    price: 28,
    description: 'Pão australiano, carne 150g, queijo coalho, bacon e molho da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-pineapple-old-burguer',
    name: 'Pineapple Old Burguer',
    category: 'Hambúrgueres',
    price: 26,
    description: 'Pão australiano, carne 150g, queijo prato, abacaxi, bacon, geleia de pimenta e molho da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-batata-m',
    name: 'Batata M 240g',
    category: 'Batatas',
    price: 10,
    description: 'Porção de batata tamanho M com 240g.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-batata-g',
    name: 'Batata G 300g',
    category: 'Batatas',
    price: 13,
    description: 'Porção de batata tamanho G com 300g.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-batata-costela-sour-cream',
    name: 'Batata com Costela e Sour Cream',
    category: 'Batatas',
    price: 22,
    description: 'Batata com costela desfiada e sour cream.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-combo-old-prime',
    name: 'Combo Old Prime',
    category: 'Combos',
    price: 42,
    description: 'Cheddar Old Burguer, batata P e milk-shake.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-combo-old',
    name: 'Combo Old',
    category: 'Combos',
    price: 32,
    description: 'Cheddar Old Burguer, batata P e refrigerante lata.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-refri-lata',
    name: 'Refri Lata',
    category: 'Bebidas',
    price: 6,
    description: 'Refrigerante em lata.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-refrigerante-600ml',
    name: 'Refrigerante 600ml',
    category: 'Bebidas',
    price: 7,
    description: 'Refrigerante 600ml.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-refrigerante-1-litro',
    name: 'Refrigerante 1 Litro',
    category: 'Bebidas',
    price: 10,
    description: 'Refrigerante 1 litro.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-suco',
    name: 'Suco',
    category: 'Bebidas',
    price: 7,
    description: 'Suco da casa.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-milk-shake',
    name: 'Milk-Shake',
    category: 'Bebidas',
    price: 15,
    description: 'Milk-shake Old Brother.',
    active: true,
    available: true,
    image: '',
  },
  {
    id: 'ob-agua',
    name: 'Água',
    category: 'Bebidas',
    price: 3,
    description: 'Água mineral.',
    active: true,
    available: true,
    image: '',
  },
]

async function api(path, options = {}) {
  const token = localStorage.getItem('ob.api.token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token && options.auth !== false) headers.Authorization = `Bearer ${token}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeout || 15000)
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: 'no-store', signal: controller.signal })
    const text = await res.text()
    const data = text ? JSON.parse(text) : null
    if (res.status === 401) {
      localStorage.removeItem('ob.api.token')
      localStorage.removeItem('ob.api.auth')
      const authError = new Error(data?.error || 'Sessão expirada. Faça login novamente.')
      authError.status = 401
      authError.auth = true
      throw authError
    }
    if (!res.ok) throw new Error(data?.error || 'Erro ao comunicar com a API')
    return data
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('A API demorou para responder. Verifique backend/Supabase.')
    throw err
  } finally { clearTimeout(timeout) }
}

function money(v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0)) }
function statusLabel(s) { return ({ livre:'Livre', ocupada:'Ocupada', preparo:'Em preparo', pronto:'Pronto', pagamento:'Aguardando pagamento', inativa:'Inativa', novo:'Novo', aguardando_pagamento:'Aguardando pagamento', saiu_entrega:'Saiu para entrega', entregue:'Entregue', finalizado:'Finalizado', cancelado:'Cancelado' })[s] || s }
function originLabel(s) { return ({ mesa:'Mesa', delivery:'Delivery', retirada:'Retirada', balcao:'Balcão', whatsapp:'WhatsApp' })[s] || s }
function orderNumber(n) { return String(n || 0).padStart(5, '0') }
function totalItems(items = []) { return items.reduce((s, i) => s + Number(i.unit_price ?? i.price ?? 0) * Number(i.quantity ?? i.qty ?? 0), 0) }
function orderTotal(order) { return totalItems(order.items) + Number(order.delivery_fee || order.deliveryFee || 0) }
function tableOrders(table) { return table?.session?.orders || [] }
function tableSessionTotal(table) { return tableOrders(table).reduce((s, o) => s + orderTotal(o), 0) }
function pluralize(count, singular, plural = `${singular}s`) { return Number(count) === 1 ? singular : plural }
function dateBR(v) { return v ? new Date(v).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '' }
function normalizeProduct(p) { return { ...p, active: p.available, category: p.category_name || p.category || 'Cardápio', image: p.image_url || '' } }
function normalizeTable(t, orders = []) {
  const sessionOrders = t.session?.id ? orders.filter(o => o.table_session_id === t.session.id && o.status !== 'cancelado') : []
  return { ...t, session: t.session ? { ...t.session, orders: sessionOrders } : null }
}
function normalizeStock(i) { return { ...i, qty: Number(i.quantity || 0), min: Number(i.minimum_quantity || 0), cost: Number(i.unit_cost || 0) } }

function Button({ children, variant='primary', ...props }) { return <button {...props} className={`btn ${variant} ${props.className || ''}`}>{children}</button> }
function Card({ children, className='' }) { return <div className={`card ${className}`}>{children}</div> }
function Pill({ children, type='' }) { return <span className={`pill ${type}`}>{children}</span> }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }
function Row({ a, b }) { return <div className="row"><span>{a}</span><b>{b}</b></div> }
function KPI({ label, value }) { return <Card className="kpi"><span>{label}</span><strong>{value}</strong></Card> }
function productEmoji(product = {}) {
  const haystack = `${product.category || ''} ${product.name || ''}`.toLowerCase()
  if (haystack.includes('batata')) return '🍟'
  if (haystack.includes('bebida') || haystack.includes('refri') || haystack.includes('suco')) return '🥤'
  if (haystack.includes('água') || haystack.includes('agua')) return '💧'
  if (haystack.includes('milk')) return '🥤'
  if (haystack.includes('combo') || haystack.includes('promo')) return '🍔🔥'
  return '🍔'
}
function ProductImage({ product, className='' }) { return <div className={`food-img ${className}`} style={product?.image ? { backgroundImage:`linear-gradient(180deg,rgba(18,9,7,.05),rgba(18,9,7,.70)),url(${product.image})` } : undefined}>{!product?.image && productEmoji(product)}</div> }
function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 800) }

function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[char]))
}
function orderLabel(order = {}) {
  if (order.origin === 'mesa') return order.table_name || order.tableName || 'Mesa'
  return originLabel(order.origin)
}
function printWindow(html, blockedMessage = 'Permita pop-ups para imprimir.') {
  const popup = window.open('', '_blank', 'width=420,height=720')
  if (!popup) {
    alert(blockedMessage)
    return
  }
  popup.document.open()
  popup.document.write(html)
  popup.document.close()
}
function buildOrderPrintHtml(order = {}, type = 'cozinha') {
  const items = order.items || []
  const showPrices = type === 'fechamento'
  const title = showPrices ? 'FECHAMENTO / CONTA' : 'COMANDA DE COZINHA'
  const isDelivery = ['delivery', 'whatsapp'].includes(order.origin)
  const itemsHtml = items.length ? items.map((item) => {
    const qty = Number(item.quantity || item.qty || 0)
    const unitPrice = Number(item.unit_price || item.price || 0)
    const name = escapeHtml(item.product_name || item.name || 'Produto')
    const notes = item.notes ? `<small>Obs: ${escapeHtml(item.notes)}</small>` : ''
    const price = showPrices ? `<strong>${money(qty * unitPrice)}</strong>` : ''
    return `<div class="item"><div><b>${qty}x ${name}</b>${notes}</div>${price}</div>`
  }).join('') : '<p class="muted">Sem itens no pedido.</p>'

  return `<!doctype html><html><head><meta charset="utf-8" />
  <title>Pedido #${escapeHtml(orderNumber(order.order_number))}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#fff;color:#111}.ticket{width:80mm;max-width:100%;padding:12px;margin:0 auto}.brand{text-align:center;border-bottom:1px dashed #111;padding-bottom:8px;margin-bottom:10px}.brand h1{font-size:18px;margin:0 0 2px}.brand span{font-size:11px;text-transform:uppercase;letter-spacing:.08em}.meta{font-size:12px;line-height:1.45;border-bottom:1px dashed #111;padding-bottom:8px;margin-bottom:10px}.meta b{display:inline-block;min-width:72px}.item{display:flex;justify-content:space-between;gap:10px;font-size:13px;border-bottom:1px dotted #999;padding:7px 0}.item small{display:block;font-size:11px;margin-top:3px}.total{border-top:1px dashed #111;margin-top:10px;padding-top:8px;font-size:14px}.total div{display:flex;justify-content:space-between;margin:4px 0}.footer{text-align:center;font-size:10px;margin-top:12px;border-top:1px dashed #111;padding-top:8px}.muted{font-size:12px;color:#555}@media print{body{margin:0}.ticket{width:80mm;padding:6px}@page{size:80mm auto;margin:4mm}}
  </style></head><body><main class="ticket"><section class="brand"><h1>OLD BROTHER</h1><span>${title}</span></section><section class="meta">
  <div><b>Pedido:</b> #${escapeHtml(orderNumber(order.order_number))}</div>
  <div><b>Origem:</b> ${escapeHtml(orderLabel(order))}</div>
  <div><b>Status:</b> ${escapeHtml(statusLabel(order.status))}</div>
  <div><b>Cliente:</b> ${escapeHtml(order.customer_name || 'Não informado')}</div>
  ${order.customer_phone ? `<div><b>Telefone:</b> ${escapeHtml(order.customer_phone)}</div>` : ''}
  ${isDelivery && order.delivery_address ? `<div><b>Endereço:</b> ${escapeHtml(order.delivery_address)}</div>` : ''}
  ${isDelivery && order.delivery_neighborhood ? `<div><b>Bairro:</b> ${escapeHtml(order.delivery_neighborhood)}</div>` : ''}
  ${isDelivery && order.delivery_reference ? `<div><b>Referência:</b> ${escapeHtml(order.delivery_reference)}</div>` : ''}
  ${order.notes ? `<div><b>Obs:</b> ${escapeHtml(order.notes)}</div>` : ''}
  <div><b>Horário:</b> ${escapeHtml(dateBR(order.created_at) || new Date().toLocaleString('pt-BR'))}</div>
  </section><section>${itemsHtml}</section>${showPrices ? `<section class="total"><div><span>Total pedido</span><strong>${money(orderTotal(order))}</strong></div></section>` : ''}<section class="footer">Impresso pelo sistema Old Brother<br/>${new Date().toLocaleString('pt-BR')}</section></main><script>window.onload=()=>{window.focus();setTimeout(()=>window.print(),250)}</script></body></html>`
}
function printOrder(order, type = 'cozinha') {
  if (!order) return
  printWindow(buildOrderPrintHtml(order, type), 'Permita pop-ups para imprimir a comanda.')
}
function buildTableReceiptPrintHtml(table = {}, method = 'pix', discount = 0, service = 0) {
  const orders = table.session?.orders || []
  const subtotal = orders.reduce((s, o) => s + orderTotal(o), 0)
  const serviceValue = subtotal * (Number(service || 0) / 100)
  const total = subtotal + serviceValue - Number(discount || 0)
  const orderRows = orders.length ? orders.map(o => `<div class="order"><span>#${orderNumber(o.order_number)} • ${escapeHtml(statusLabel(o.status))}</span><strong>${money(orderTotal(o))}</strong></div>`).join('') : '<p>Sem pedidos.</p>'
  return `<!doctype html><html><head><meta charset="utf-8" /><title>Fechamento ${escapeHtml(table.name || '')}</title><style>*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#fff;color:#111}.ticket{width:80mm;max-width:100%;padding:12px;margin:0 auto}.brand{text-align:center;border-bottom:1px dashed #111;padding-bottom:8px;margin-bottom:10px}.brand h1{font-size:18px;margin:0 0 2px}.brand span{font-size:11px;text-transform:uppercase;letter-spacing:.08em}.meta{font-size:12px;line-height:1.5;border-bottom:1px dashed #111;padding-bottom:8px;margin-bottom:10px}.order,.total div{display:flex;justify-content:space-between;gap:10px;font-size:13px;border-bottom:1px dotted #aaa;padding:6px 0}.total{border-top:1px dashed #111;margin-top:10px;padding-top:8px}.footer{text-align:center;font-size:10px;margin-top:12px;border-top:1px dashed #111;padding-top:8px}@media print{.ticket{width:80mm;padding:6px}@page{size:80mm auto;margin:4mm}}</style></head><body><main class="ticket"><section class="brand"><h1>OLD BROTHER</h1><span>FECHAMENTO DE CONTA</span></section><section class="meta"><div><b>Mesa:</b> ${escapeHtml(table.name || '')}</div><div><b>Cliente:</b> ${escapeHtml(table.session?.customerName || table.session?.customer_name || 'Não informado')}</div><div><b>Pagamento:</b> ${escapeHtml(payMethods.find(p=>p.value===method)?.label || method)}</div><div><b>Horário:</b> ${new Date().toLocaleString('pt-BR')}</div></section><section>${orderRows}</section><section class="total"><div><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div><span>Serviço (${Number(service||0)}%)</span><strong>${money(serviceValue)}</strong></div><div><span>Desconto</span><strong>${money(discount)}</strong></div><div><span>Total</span><strong>${money(total)}</strong></div></section><section class="footer">Obrigado pela preferência<br/>Old Brother</section></main><script>window.onload=()=>{window.focus();setTimeout(()=>window.print(),250)}</script></body></html>`
}
function printTableReceipt(table, method, discount, service) {
  if (!table?.session) return
  printWindow(buildTableReceiptPrintHtml(table, method, discount, service), 'Permita pop-ups para imprimir o fechamento.')
}


export default function App() {
  const [auth, setAuth] = useState(() => { try { return JSON.parse(localStorage.getItem('ob.api.auth')) } catch { return null } })
  const [user, setUser] = useState(auth?.user || null)
  const [page, setPage] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [stock, setStock] = useState([])
  const [users, setUsers] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const browserPath = window.location.pathname
  const hashPath = window.location.hash?.replace(/^#/, '') || ''
  const path = hashPath || browserPath
  const tableRoute = path.match(/^\/cardapio\/mesa\/([^/]+)/)
  const deliveryMenuRoute = path.match(/^\/cardapio\/delivery\/?$/)

  function clearSession() {
    localStorage.removeItem('ob.api.token')
    localStorage.removeItem('ob.api.auth')
    setAuth(null)
    setUser(null)
    setStock([])
    setUsers([])
    setDashboard(null)
  }

  async function loadAll({ silent = false } = {}) {
    if (!silent) setLoading(true)
    setError('')
    try {
      const [apiProducts, apiTables] = await Promise.all([
        api('/products', { auth:false }),
        api('/tables', { auth:false })
      ])

      let orderRows = []
      if (user) {
        try {
          orderRows = await api('/orders') || []
        } catch (err) {
          if (err.status === 401 || err.auth) {
            clearSession()
            return
          }
          throw err
        }
      }

      setOrders(orderRows)
      setProducts((apiProducts || []).map(normalizeProduct))
      setTables((apiTables || []).map(t => normalizeTable(t, orderRows)))

      if (user) {
        const extra = await Promise.allSettled([api('/stock'), api('/users'), api('/reports/dashboard')])
        const hasAuthError = extra.some(x => x.status === 'rejected' && (x.reason?.status === 401 || x.reason?.auth))
        if (hasAuthError) {
          clearSession()
          return
        }
        if (extra[0].status === 'fulfilled') setStock((extra[0].value || []).map(normalizeStock))
        if (extra[1].status === 'fulfilled') setUsers(extra[1].value || [])
        if (extra[2].status === 'fulfilled') setDashboard(extra[2].value)
      }
    } catch (err) {
      if (err.status === 401 || err.auth) {
        clearSession()
        return
      }
      setError(err.message)
    } finally { if (!silent) setLoading(false) }
  }

  useEffect(() => { loadAll() }, [user])
  useEffect(() => { const t = setInterval(() => loadAll({ silent:true }), tableRoute ? 1500 : POLL_MS); return () => clearInterval(t) }, [user, tableRoute?.[1]])

  if (deliveryMenuRoute) return <CustomerDeliveryMenu products={products} />
  if (tableRoute) return <CustomerTablePage tableId={decodeURIComponent(tableRoute[1])} tables={tables} products={products} reload={() => loadAll({ silent:true })} />
  if (!user) return <Login onLogin={(data) => { localStorage.removeItem('ob.api.token'); localStorage.removeItem('ob.api.auth'); localStorage.setItem('ob.api.token', data.token); localStorage.setItem('ob.api.auth', JSON.stringify(data)); setError(''); setAuth(data); setUser(data.user); setPage(data.user.role === 'cozinha' ? 'cozinha' : data.user.role === 'caixa' ? 'caixa' : data.user.role === 'delivery' ? 'delivery' : data.user.role === 'estoque' ? 'estoque' : 'dashboard') }} />

  const logout = () => { localStorage.removeItem('ob.api.token'); localStorage.removeItem('ob.api.auth'); setAuth(null); setUser(null) }
  const common = { user, products, setProducts, tables, setTables, orders, setOrders, stock, setStock, users, setUsers, dashboard, reload: loadAll, loading, error }
  return <Shell user={user} page={page} setPage={setPage} onLogout={logout}>
    {error && <p className="error">{error}</p>}
    {page === 'dashboard' && <Dashboard {...common} />}
    {page === 'mesas' && <TablesPage {...common} />}
    {page === 'pedidos' && <OrdersCenter {...common} />}
    {page === 'cozinha' && <KitchenPage {...common} />}
    {page === 'delivery' && <DeliveryPage {...common} />}
    {page === 'caixa' && <CashierPage {...common} />}
    {page === 'cardapio' && <MenuPage products={products} deliveryMode />}
    {page === 'produtos' && <ProductsPage {...common} />}
    {page === 'estoque' && <StockPage {...common} />}
    {page === 'usuarios' && <UsersPage {...common} />}
    {page === 'qrcodes' && <QRCodesPage tables={tables} />}
    {page === 'relatorios' && <ReportsPage {...common} />}
  </Shell>
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, pin }),
        auth: false,
      })

      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-screen official-login">
      <section className="login-hero official-login-hero">
        <div className="login-brand-lockup">
          <div className="login-logo-mark">OB</div>

          <div>
            <span className="login-company">OLD BROTHER</span>
            <strong>Sistema Administrativo</strong>
          </div>
        </div>

        <div className="login-copy">
          <p className="eyebrow">Gestão operacional</p>
          <h1>Controle interno da hamburgueria</h1>
          <p>
            Plataforma de acesso restrito para gestão de pedidos, mesas,
            estoque, caixa e relatórios da operação.
          </p>
        </div>

        <div className="login-system-badge">
          <span>Ambiente</span>
          <strong>Painel operacional</strong>
        </div>
      </section>

      <Card className="login-box official-login-box">
        <div className="login-box-head">
          <p className="eyebrow">Acesso restrito</p>
          <h2>Entrar no sistema</h2>
          <p>Informe suas credenciais para continuar.</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <Field label="E-mail">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </Field>

          <Field label="PIN">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Digite seu PIN"
              autoComplete="current-password"
            />
          </Field>

          {error && <p className="error">{error}</p>}

          <Button className="full" disabled={loading}>
            {loading ? 'Validando acesso...' : 'Acessar painel'}
          </Button>
        </form>

        <p className="login-footer-note">Uso exclusivo da equipe autorizada.</p>
      </Card>
    </main>
  )
}

function Shell({ children, user, page, setPage, onLogout }) {
  const menu = [
    ['dashboard','Dashboard',['admin','gerente']], ['mesas','Mesas',['admin','gerente','garcom','caixa']], ['pedidos','Central de Pedidos',['admin','gerente','garcom','cozinha','caixa','delivery']], ['cozinha','Cozinha/KDS',['admin','gerente','cozinha']], ['delivery','Delivery',['admin','gerente','delivery','caixa']], ['caixa','Caixa',['admin','gerente','caixa']], ['cardapio','Cardápio',['admin','gerente','garcom','delivery']], ['produtos','Produtos',['admin','gerente']], ['estoque','Estoque',['admin','gerente','estoque']], ['usuarios','Usuários',['admin','gerente']], ['qrcodes','QR Codes',['admin','gerente']], ['relatorios','Relatórios',['admin','gerente','caixa']]
  ].filter(m => m[2].includes(user.role))
  return <div className="app"><aside className="sidebar"><div className="sidebar-head"><div className="brand"><div className="brand-mark">OB</div><div><strong>OLD BROTHER</strong><span>Sistema</span></div></div><Button variant="ghost" className="logout-btn mobile-logout" onClick={onLogout}>Sair</Button></div><div className="userbox"><span>Logado como</span><strong>{user.name}</strong><Pill>{user.role}</Pill></div><Button variant="ghost" className="logout-btn desktop-logout" onClick={onLogout}>Sair</Button><nav className="main-nav">{menu.map(([id,label]) => <button key={id} onClick={() => setPage(id)} className={page===id?'active':''}>{label}</button>)}</nav></aside><section className="content"><header className="topbar"><div><strong>{menu.find(m=>m[0]===page)?.[1] || 'Old Brother'}</strong><span>Old Brother Hamburgueria</span></div><Pill type="gold">{new Date().toLocaleDateString('pt-BR')}</Pill></header>{children}</section></div>
}

function Dashboard({ tables, orders, stock, dashboard }) {
  const [period, setPeriod] = useState('daily')
  const openOrders = orders.filter(o => !['finalizado','cancelado'].includes(o.status)).length
  const periods = dashboard?.periods || { daily: dashboard?.today || {} }
  const periodData = periods?.[period] || {}
  const byOrigin = origins.map(o => dashboard?.by_origin?.find(x => x.period === period && x.origin === o) || { origin:o, total:0, count:0 })
  const byPay = payMethods.map(p => dashboard?.by_payment?.find(x => x.period === period && x.method === p.value) || { method:p.value, total:0, count:0 })
  return <div className="page">
    <div className="title"><p className="eyebrow">Visão geral</p><h1>Operação em tempo real</h1><p className="title-sub">Faturamento diário, semanal, mensal e total para controle completo da hamburgueria.</p></div>
    <div className="kpis">
      {periodOptions.map(opt => <KPI key={opt.value} label={opt.kpi} value={money(periods?.[opt.value]?.total || 0)} />)}
    </div>
    <div className="kpis compact-kpis">
      <KPI label="Pedidos em aberto" value={openOrders} />
      <KPI label="Mesas ocupadas" value={`${tables.filter(t=>t.status!=='livre').length}/${tables.length}`} />
      <KPI label="Estoque baixo" value={stock.filter(i => i.active && i.qty <= i.min).length} />
      <KPI label="Ticket médio do período" value={money(periodData.average_ticket || 0)} />
    </div>
    <Card>
      <div className="section-head"><div><h3>Análise de faturamento</h3><p className="muted">Escolha o período para ver origem, forma de pagamento e quantidade de vendas.</p></div><select className="period-select" value={period} onChange={e=>setPeriod(e.target.value)}>{periodOptions.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
      <div className="dashboard-period-summary">
        <Row a="Faturamento do período" b={money(periodData.total || 0)} />
        <Row a="Vendas fechadas" b={Number(periodData.sales_count || 0)} />
      </div>
    </Card>
    <div className="grid2"><Card><h3>Faturamento por origem</h3>{byOrigin.map(x => <Row key={x.origin} a={`${originLabel(x.origin)} • ${Number(x.count || 0)} ${pluralize(x.count, 'venda')}`} b={money(x.total)} />)}</Card><Card><h3>Faturamento por pagamento</h3>{byPay.map(x => <Row key={x.method} a={`${payMethods.find(p=>p.value===x.method)?.label || x.method} • ${Number(x.count || 0)} ${pluralize(x.count, 'venda')}`} b={money(x.total)} />)}</Card></div>
    <Card><h3>Pedidos em andamento</h3><div className="items-line">{orderStatuses.filter(s=>!['finalizado','cancelado'].includes(s)).map(s => <span key={s}>{statusLabel(s)}: {orders.filter(o=>o.status===s).length}</span>)}</div></Card>
  </div>
}

function TablesPage({ tables, products, user, reload }) {
  const [selected, setSelected] = useState(tables[0]?.id || '')
  const [cart, setCart] = useState([])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (!selected && tables[0]?.id) setSelected(tables[0].id) }, [tables, selected])

  const table = tables.find(t => t.id === selected)
  const currentOrders = tableOrders(table)
  const currentTotal = tableSessionTotal(table)

  const add = (p) => {
    const ex = cart.find(i => i.product_id === p.id && i.notes === note)
    setCart(ex
      ? cart.map(i => i === ex ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { product_id: p.id, product_name: p.name, unit_price: Number(p.price), quantity: 1, notes: note }]
    )
    setNote('')
  }

  const send = async () => {
    if (!table?.session?.id || !cart.length) return
    setBusy(true)
    try {
      await api('/orders', { method: 'POST', body: JSON.stringify({ origin: 'mesa', table_session_id: table.session.id, customer_name: table.session.customerName, items: cart }) })
      setCart([])
      await reload()
    } finally { setBusy(false) }
  }

  const requestPayment = async () => {
    if (!table?.session?.id) return
    setBusy(true)
    try {
      await api(`/tables/sessions/${table.session.id}/send-to-payment`, { method: 'POST' })
      await reload()
    } finally { setBusy(false) }
  }

  return <div className="page">
    <div className="title"><p className="eyebrow">Salão e pátio</p><h1>Mapa de mesas</h1></div>
    <div className="grid-main mesas-layout">
      <Card className="tables-map-card">
        <div className="table-grid">
          {tables.filter(t => t.active).map(t => {
            const ordersCount = t.session?.orders?.length || 0
            return <button className={`table-card ${selected === t.id ? 'selected' : ''}`} key={t.id} onClick={() => setSelected(t.id)}>
              <strong>{t.name}</strong>
              <Pill type={t.status}>{statusLabel(t.status)}</Pill>
              <span>{t.session ? `${t.session.customerName || 'Cliente'} • ${ordersCount} ${pluralize(ordersCount, 'pedido')}` : t.area}</span>
            </button>
          })}
        </div>
      </Card>

      <Card className="table-detail-card">
        {!table ? <p className="muted">Selecione uma mesa.</p> : <div className="table-detail">
          <div className="table-detail-head">
            <div>
              <h2>{table.name}</h2>
              <p className="muted">{table.session ? `Cliente: ${table.session.customerName || 'Não informado'} • ${table.session.people || 1} ${pluralize(table.session.people || 1, 'pessoa')}` : 'Mesa livre. Abra pelo QR Code.'}</p>
            </div>
            <Pill type={table.status}>{statusLabel(table.status)}</Pill>
          </div>

          {!table.session ? <EmptyQRCode table={table} /> : <>
            <div className="table-summary-box">
              <strong>Total da mesa: {money(currentTotal)}</strong>
              <span>{currentOrders.length} {pluralize(currentOrders.length, 'pedido')} nessa sessão</span>
            </div>

            <Field label="Observação do próximo item"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: sem cebola" /></Field>

            <div className="product-list">
              {products.filter(p => p.active).map(p => <button key={p.id} onClick={() => add(p)}>
                <ProductImage product={p} className="mini" />
                <span><b>{p.name}</b><small>{p.category}</small></span>
                <b className="price">{money(p.price)}</b>
              </button>)}
            </div>

            <Cart cart={cart} setCart={setCart} />

            <div className="actions table-actions">
              <Button disabled={!cart.length || busy} onClick={send}>Criar pedido e enviar cozinha</Button>
              <Button disabled={busy} variant="secondary" onClick={requestPayment}>Enviar mesa para o caixa</Button>
            </div>

            <div className="section-head compact-head"><div><h3>Pedidos da mesa</h3><p className="muted">Comandas registradas nessa sessão.</p></div></div>
            <OrdersMini orders={currentOrders} />
          </>}
        </div>}
      </Card>
    </div>
  </div>
}
function EmptyQRCode({ table }) {
  const url = `${location.origin}/#/cardapio/mesa/${table.id}`
  return <div className="empty qr-empty">
    <QRCodeCanvas value={url} size={160} />
    <div><p>QR da {table.name}</p><span>Ao escanear, o cliente inicia o atendimento desta mesa.</span></div>
    <small>{url}</small>
    <Button variant="secondary" onClick={() => window.open(url, '_blank')}>Abrir cardápio da mesa</Button>
  </div>
}
function Cart({ cart, setCart }) { return <div className="cart"><h3>Carrinho do novo pedido</h3>{cart.map((i,idx) => <div className="row" key={idx}><span>{i.quantity}x {i.product_name} {i.notes && <em>• {i.notes}</em>}</span><b>{money(i.quantity*i.unit_price)}</b></div>)}{!cart.length && <p className="muted">Adicione itens para criar um pedido.</p>}<b>Total: {money(totalItems(cart))}</b>{cart.length>0 && <Button variant="secondary" onClick={()=>setCart([])}>Limpar</Button>}</div> }
function OrdersMini({ orders }) { return <div className="list">{orders.map(o => <div className="list-item" key={o.id}><div><strong>Pedido #{orderNumber(o.order_number)}</strong><span>{statusLabel(o.status)} • {dateBR(o.created_at)}</span></div><div className="actions compact"><b>{money(orderTotal(o))}</b><Button variant="secondary" onClick={()=>printOrder(o)}>Imprimir</Button></div></div>)}{!orders.length && <p className="muted">Nenhum pedido nessa mesa.</p>}</div> }

function OrdersCenter({ orders, reload }) {
  const [status,setStatus] = useState('todos'), [origin,setOrigin] = useState('todos'), [q,setQ] = useState('')
  const filtered = orders.filter(o => (status==='todos'||o.status===status) && (origin==='todos'||o.origin===origin) && (`${o.order_number} ${o.customer_name||''} ${o.customer_phone||''}`.toLowerCase().includes(q.toLowerCase())))
  const change = async (id, status) => { await api(`/orders/${id}/status`, { method:'PATCH', body:JSON.stringify({ status }) }); await reload() }
  return <div className="page"><div className="title"><p className="eyebrow">Operação</p><h1>Central de pedidos</h1></div><div className="filters"><input placeholder="Buscar pedido, cliente ou telefone" value={q} onChange={e=>setQ(e.target.value)} /><select value={origin} onChange={e=>setOrigin(e.target.value)}><option value="todos">Todas origens</option>{origins.map(o=><option key={o} value={o}>{originLabel(o)}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="todos">Todos status</option>{orderStatuses.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></div><div className="orders-list">{filtered.map(o => <OrderCard key={o.id} order={o} onStatus={change} />)}{!filtered.length && <Card><p className="muted">Nenhum pedido encontrado.</p></Card>}</div></div>
}
function OrderCard({ order, onStatus }) { return <div className="order-card"><div className="between"><div><strong>Pedido #{orderNumber(order.order_number)} • {originLabel(order.origin)}</strong><span>{order.customer_name || 'Cliente'} • {dateBR(order.created_at)}</span></div><Pill type={order.status}>{statusLabel(order.status)}</Pill></div><div className="items-line">{(order.items||[]).map(i => <span key={i.id}>{i.quantity}x {i.product_name}</span>)}</div><div className="between"><b>{money(orderTotal(order))}</b><div className="actions compact"><Button variant="secondary" onClick={()=>printOrder(order)}>Imprimir</Button>{order.status==='novo' && <Button onClick={()=>onStatus(order.id,'preparo')}>Iniciar</Button>}{order.status==='preparo' && <Button onClick={()=>onStatus(order.id,'pronto')}>Pronto</Button>}{order.status==='pronto' && <Button onClick={()=>onStatus(order.id,'aguardando_pagamento')}>Pagamento</Button>}{!['finalizado','cancelado'].includes(order.status) && <Button variant="danger" onClick={()=>onStatus(order.id,'cancelado')}>Cancelar</Button>}</div></div></div> }
function KitchenPage(props) { const lanes = ['novo','preparo','pronto']; return <div className="page"><div className="title"><p className="eyebrow">Cozinha</p><h1>KDS de produção</h1></div><div className="kanban">{lanes.map(l => <Card key={l}><h3>{statusLabel(l)}</h3>{props.orders.filter(o=>o.status===l).map(o=><OrderCard key={o.id} order={o} onStatus={async (id,status)=>{ await api(`/orders/${id}/status`, { method:'PATCH', body:JSON.stringify({status}) }); await props.reload() }} />)}{!props.orders.filter(o=>o.status===l).length && <p className="muted">Sem pedidos.</p>}</Card>)}</div></div> }

function DeliveryPage({ products, reload }) {
  const [form,setForm]=useState({origin:'delivery',customer_name:'',customer_phone:'',delivery_address:'',delivery_neighborhood:'',delivery_reference:'',delivery_fee:0,notes:''})
  const [cart,setCart]=useState([]), [note,setNote]=useState(''), [busy,setBusy]=useState(false)
  const add=(p)=>setCart([...cart,{product_id:p.id,product_name:p.name,unit_price:Number(p.price),quantity:1,notes:note}])
  const save=async()=>{ if(!form.customer_name || !cart.length)return; setBusy(true); try{ await api('/orders',{method:'POST',body:JSON.stringify({...form,type:form.origin,items:cart})}); setCart([]); setForm({origin:'delivery',customer_name:'',customer_phone:'',delivery_address:'',delivery_neighborhood:'',delivery_reference:'',delivery_fee:0,notes:''}); await reload() } finally{ setBusy(false) } }
  return <div className="page"><div className="title"><p className="eyebrow">Atendimento externo</p><h1>Delivery, retirada e balcão</h1></div><div className="grid-main"><Card><div className="form-grid"><Field label="Tipo"><select value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})}><option value="delivery">Delivery</option><option value="retirada">Retirada</option><option value="balcao">Balcão</option><option value="whatsapp">WhatsApp</option></select></Field><Field label="Cliente"><input value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})}/></Field><Field label="Telefone"><input value={form.customer_phone} onChange={e=>setForm({...form,customer_phone:e.target.value})}/></Field><Field label="Taxa entrega"><input type="number" value={form.delivery_fee} onChange={e=>setForm({...form,delivery_fee:e.target.value})}/></Field><Field label="Endereço"><input value={form.delivery_address} onChange={e=>setForm({...form,delivery_address:e.target.value})}/></Field><Field label="Bairro"><input value={form.delivery_neighborhood} onChange={e=>setForm({...form,delivery_neighborhood:e.target.value})}/></Field><Field label="Referência"><input value={form.delivery_reference} onChange={e=>setForm({...form,delivery_reference:e.target.value})}/></Field><Field label="Observação"><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></Field></div><Field label="Observação do item"><input value={note} onChange={e=>setNote(e.target.value)} /></Field><div className="product-list">{products.filter(p=>p.active).map(p=><button key={p.id} onClick={()=>add(p)}><ProductImage product={p} className="mini"/><span><b>{p.name}</b><small>{p.category}</small></span><b>{money(p.price)}</b></button>)}</div><Cart cart={cart} setCart={setCart}/><Button disabled={busy || !cart.length} onClick={save}>Criar pedido externo</Button></Card><Card><h3>Pedidos externos em aberto</h3><p className="muted">Acompanhe na Central de Pedidos e finalize pelo Caixa.</p></Card></div></div>
}

function CashierPage({ tables, orders, reload }) {
  const [method,setMethod]=useState('pix'), [discount,setDiscount]=useState(0), [serviceEnabled,setServiceEnabled]=useState(false), [service,setService]=useState(10), [busy,setBusy]=useState(false)
  const servicePercent = serviceEnabled ? Number(service || 0) : 0
  const external = orders.filter(o=>o.status==='aguardando_pagamento' && o.origin !== 'mesa')
  const payableTables = tables.filter(t=>t.session && (t.status==='pagamento' || t.session.orders?.some(o=>o.status==='aguardando_pagamento')))
  const closeExternal=async(id)=>{ setBusy(true); try{ await api('/payments/close-order',{method:'POST',body:JSON.stringify({order_id:id,method,discount:Number(discount||0)})}); await reload() } finally{ setBusy(false) } }
  const closeTable=async(sessionId)=>{ setBusy(true); try{ await api('/payments/close-table-session',{method:'POST',body:JSON.stringify({table_session_id:sessionId,method,discount:Number(discount||0),service_fee_percent:servicePercent})}); await reload() } finally{ setBusy(false) } }
  return <div className="page"><div className="title"><p className="eyebrow">Caixa</p><h1>Fechamento de contas</h1><p className="title-sub">Os 10% do garçom ficam desligados por padrão e só entram quando caixa, gerente ou admin ativar.</p></div><Card><div className="toolbar cashier-toolbar"><select value={method} onChange={e=>setMethod(e.target.value)}>{payMethods.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select><input type="number" value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="Desconto"/><label className="switch-line"><input type="checkbox" checked={serviceEnabled} onChange={e=>setServiceEnabled(e.target.checked)} /><span>Adicionar 10% do garçom</span></label><input type="number" value={service} onChange={e=>setService(e.target.value)} placeholder="Taxa serviço %" disabled={!serviceEnabled}/></div></Card><div className="grid2"><Card><h3>Mesas aguardando pagamento</h3>{payableTables.map(t=>{ const subtotal=(t.session.orders||[]).reduce((s,o)=>s+orderTotal(o),0); const serviceValue=subtotal*(servicePercent/100); const finalTotal=Math.max(subtotal+serviceValue-Number(discount||0),0); return <div className="pay-card" key={t.id}><div className="between"><div><strong>{t.name}</strong><span>{t.session.customerName} • {t.session.orders?.length||0} pedidos {servicePercent ? `• +${servicePercent}% garçom` : '• sem 10%'}</span></div><b>{money(finalTotal)}</b></div><div className="actions compact"><Button variant="secondary" onClick={()=>printTableReceipt(t, method, discount, servicePercent)}>Imprimir conta</Button><Button disabled={busy} onClick={()=>closeTable(t.session.id)}>Fechar mesa</Button></div></div>})}{!payableTables.length && <p className="muted">Nenhuma mesa aguardando pagamento.</p>}</Card><Card><h3>Delivery / retirada / balcão</h3>{external.map(o=><div className="pay-card" key={o.id}><div className="between"><div><strong>#{orderNumber(o.order_number)} • {originLabel(o.origin)}</strong><span>{o.customer_name} • {o.customer_phone}</span></div><b>{money(orderTotal(o))}</b></div><div className="actions compact"><Button variant="secondary" onClick={()=>printOrder(o,'fechamento')}>Imprimir</Button><Button disabled={busy} onClick={()=>closeExternal(o.id)}>Fechar pedido</Button></div></div>)}{!external.length && <p className="muted">Nenhum pedido externo aguardando pagamento.</p>}</Card></div></div>
}

function CustomerDeliveryMenu({ products }) {
  return <main className="customer delivery-public"><MenuPage products={products} deliveryMode publicMode /></main>
}

function MenuPage({ products, deliveryMode = false, publicMode = false }) {
  const [q,setQ]=useState('')
  const [cat,setCat]=useState('todos')
  const [cart,setCart]=useState([])
  const [selectedProduct,setSelectedProduct]=useState(null)
  const [productDraft,setProductDraft]=useState({ quantity: 1, notes: '' })
  const [checkoutStep,setCheckoutStep]=useState(null)
  const [deliveryType,setDeliveryType]=useState('entrega')
  const [payment,setPayment]=useState({ method: 'pix', changeFor: '' })
  const [form,setForm]=useState({customer_name:'',customer_phone:'',delivery_address:'',delivery_neighborhood:'',delivery_reference:'',delivery_fee:DEFAULT_DELIVERY_FEE,notes:''})
  const [storePhone,setStorePhone]=useState(() => STORE_WHATSAPP || localStorage.getItem('ob.store.whatsapp') || '5591982358630')
  const menuProducts = useMemo(() => {
    const realProducts = (products || []).filter(p => p.active || p.available)
    return realProducts.length ? realProducts : OLD_BROTHER_MENU_PRODUCTS
  }, [products])
  const cats=[...new Set(menuProducts.map(p=>p.category).filter(Boolean))]
  const list=menuProducts.filter(p=>(p.active || p.available) && (cat==='todos'||p.category===cat) && `${p.name} ${p.description || ''}`.toLowerCase().includes(q.toLowerCase()))
  const groupedByCategory = cats.map(category => ({
    category,
    items: list.filter(p => p.category === category),
  })).filter(group => group.items.length)
  const subtotal=totalItems(cart)
  const deliveryFee=deliveryMode && deliveryType === 'entrega' ? Number(form.delivery_fee || 0) : 0
  const total=subtotal + deliveryFee
  const cartCount=cart.reduce((s,i)=>s+Number(i.quantity || 0),0)
  const paymentLabel={pix:'Pix', debito:'Cartão de débito', credito:'Cartão de crédito', dinheiro:'Dinheiro'}[payment.method] || payment.method

  const openProduct=(p)=>{ setSelectedProduct(p); setProductDraft({ quantity: 1, notes: '' }) }
  const closeProduct=()=>{ setSelectedProduct(null); setProductDraft({ quantity: 1, notes: '' }) }
  const add=(p, quantity = 1, notes = '')=>setCart(current=>{
    const cleanNotes=String(notes || '').trim()
    const key=`${p.id || p.name}__${cleanNotes.toLowerCase() || 'sem-observacao'}`
    const found=current.find(i=>i.cart_id===key)
    if (found) return current.map(i=>i.cart_id===key ? {...i,quantity:i.quantity+Number(quantity || 1)} : i)
    return [...current,{cart_id:key,product_id:p.id,product_name:p.name,unit_price:Number(p.price),quantity:Number(quantity || 1),notes:cleanNotes}]
  })
  const addSelected=()=>{
    if(!selectedProduct) return
    add(selectedProduct, Math.max(1, Number(productDraft.quantity || 1)), productDraft.notes)
    closeProduct()
  }
  const changeQty=(cartId,delta)=>setCart(current=>current.map(i=>i.cart_id===cartId ? {...i,quantity:i.quantity+delta} : i).filter(i=>i.quantity>0))
  const removeCartItem=(cartId)=>setCart(current=>current.filter(i=>i.cart_id!==cartId))
  const savePhone=()=>{ localStorage.setItem('ob.store.whatsapp', storePhone.replace(/\D/g,'')); alert('WhatsApp da loja salvo neste navegador.') }
  const buildWhatsAppMessage=()=>{
    const itemLines=cart.map((i,idx)=>`${idx+1}. ${i.quantity}x ${i.product_name}${i.notes ? `\n   Obs: ${i.notes}` : ''} - ${money(i.quantity*i.unit_price)}`)
    const deliveryLines=[
      '',
      '*Forma de recebimento:*',
      deliveryType === 'entrega' ? 'Entrega' : 'Retirada no local',
      form.customer_name ? `Nome: ${form.customer_name}` : '',
      form.customer_phone ? `Telefone: ${form.customer_phone}` : '',
      deliveryType === 'entrega' && form.delivery_address ? `Endereço: ${form.delivery_address}` : '',
      deliveryType === 'entrega' && form.delivery_neighborhood ? `Bairro: ${form.delivery_neighborhood}` : '',
      deliveryType === 'entrega' && form.delivery_reference ? `Referência: ${form.delivery_reference}` : '',
    ].filter(Boolean)
    const paymentLines=[
      '',
      '*Pagamento:*',
      paymentLabel,
      payment.method === 'dinheiro' && payment.changeFor ? `Troco para: ${money(payment.changeFor)}` : '',
    ].filter(Boolean)
    return [
      'Olá, quero fazer um pedido no Old Brother:',
      '',
      '*Itens:*',
      ...itemLines,
      '',
      `Subtotal: ${money(subtotal)}`,
      `Taxa de entrega: ${money(deliveryFee)}`,
      `Total: ${money(total)}`,
      ...deliveryLines,
      ...paymentLines,
      form.notes ? `\n*Observação geral:* ${form.notes}` : '',
    ].filter(Boolean).join('\n')
  }
  const openWhatsApp=()=>{
    if(!cart.length) return alert('Adicione pelo menos um item ao pedido.')
    const phone=String(storePhone || '').replace(/\D/g,'') || '5591982358630'
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`,'_blank')
  }
  const startCheckout=()=>{
    if(!cart.length) return alert('Adicione pelo menos um item ao pedido.')
    setCheckoutStep('delivery')
  }

  if (!deliveryMode) return <div className="page"><div className="title"><p className="eyebrow">Cardápio</p><h1>Cardápio digital Old Brother</h1><p className="title-sub">Produtos cadastrados no sistema. Se o banco ainda não tiver produtos, o cardápio oficial carregará como referência.</p></div><div className="filters"><input placeholder="Buscar produto" value={q} onChange={e=>setQ(e.target.value)}/><select value={cat} onChange={e=>setCat(e.target.value)}><option value="todos">Todas categorias</option>{cats.map(c=><option key={c}>{c}</option>)}</select></div><div className="product-grid">{list.map(p=><Card key={p.id} className="menu-card"><ProductImage product={p}/><div className="menu-card-body"><Pill type="gold">{p.category}</Pill><h3>{p.name}</h3><p>{p.description}</p><b>{money(p.price)}</b></div></Card>)}</div></div>

  return <div className="delivery-menu-page whatsmenu-page">
    <section className="wm-hero">
      <div className="wm-brand-card">
        <div className="wm-logo">OB</div>
        <div>
          <p className="eyebrow">Old Brother Hamburgueria</p>
          <h1>Cardápio Delivery</h1>
          <p>Escolha seus itens, revise o pedido e envie direto para o WhatsApp.</p>
        </div>
      </div>
      <div className="wm-hero-info">
        <Pill type="gold">WhatsApp {OLD_BROTHER_WHATSAPP_DISPLAY}</Pill>
        <Pill>Entrega e retirada</Pill>
      </div>
    </section>

    {!publicMode && <Card className="store-whatsapp-card"><div className="section-head"><div><h3>WhatsApp da loja</h3><p className="muted">Número oficial já configurado. Use DDI + DDD + número.</p></div><div className="store-phone-actions"><input value={storePhone} onChange={e=>setStorePhone(e.target.value)} placeholder="5591982358630"/><Button variant="secondary" onClick={savePhone}>Salvar</Button></div></div></Card>}

    <section className="wm-search-card">
      <input placeholder="Buscar no cardápio" value={q} onChange={e=>setQ(e.target.value)}/>
      <div className="wm-category-tabs">
        <button className={cat==='todos' ? 'active' : ''} onClick={()=>setCat('todos')}>Todos</button>
        {cats.map(c=><button key={c} className={cat===c ? 'active' : ''} onClick={()=>setCat(c)}>{c}</button>)}
      </div>
    </section>

    <section className="wm-menu-list wm-menu-list-full">
      {groupedByCategory.map(group => <div className="wm-category-section" key={group.category}>
        <div className="wm-section-title"><span>{productEmoji({ category: group.category })}</span><h2>{group.category}</h2></div>
        <div className="wm-items">
          {group.items.map(p => <article className="wm-item" key={p.id} onClick={()=>openProduct(p)}>
            <div className="wm-item-main">
              <div className="wm-item-top">
                <h3>{p.name}</h3>
                <strong>{money(p.price)}</strong>
              </div>
              <p>{p.description || 'Item do cardápio Old Brother.'}</p>
            </div>
            <button className="wm-add-btn" onClick={(e)=>{e.stopPropagation(); openProduct(p)}} aria-label={`Adicionar ${p.name}`}>+</button>
          </article>)}
        </div>
      </div>)}
      {!list.length && <Card><p className="muted">Nenhum produto encontrado.</p></Card>}
    </section>

    {cart.length > 0 && <div className="wm-checkout-bar" role="region" aria-label="Resumo do pedido">
      <button onClick={startCheckout}>
        <span className="wm-checkout-count">{cartCount}</span>
        <span className="wm-checkout-title">Ver pedido</span>
        <strong>{money(total)}</strong>
      </button>
    </div>}

    {selectedProduct && <div className="wm-modal-backdrop" onClick={closeProduct}>
      <section className="wm-product-modal" onClick={e=>e.stopPropagation()}>
        <button className="wm-close" onClick={closeProduct}>×</button>
        <div className="wm-product-head">
          <span className="wm-product-emoji">{productEmoji(selectedProduct)}</span>
          <div>
            <p className="eyebrow">Adicionar item</p>
            <h2>{selectedProduct.name}</h2>
            <strong>{money(selectedProduct.price)}</strong>
          </div>
        </div>
        <p className="wm-product-description">{selectedProduct.description || 'Item do cardápio Old Brother.'}</p>
        <Field label="Observação"><textarea value={productDraft.notes} onChange={e=>setProductDraft({...productDraft,notes:e.target.value})} placeholder="Ex: sem cebola, ponto da carne, retirar molho..."/></Field>
        <div className="wm-product-actions">
          <div className="qty-actions wm-product-qty"><button onClick={()=>setProductDraft({...productDraft,quantity:Math.max(1,Number(productDraft.quantity || 1)-1)})}>-</button><b>{productDraft.quantity}</b><button onClick={()=>setProductDraft({...productDraft,quantity:Number(productDraft.quantity || 1)+1})}>+</button></div>
          <Button onClick={addSelected}>Adicionar • {money(Number(selectedProduct.price || 0) * Number(productDraft.quantity || 1))}</Button>
        </div>
      </section>
    </div>}

    {checkoutStep && <div className="wm-modal-backdrop wm-checkout-backdrop" onClick={()=>setCheckoutStep(null)}>
      <section className="wm-checkout-sheet" onClick={e=>e.stopPropagation()}>
        <div className="wm-sheet-head">
          <button className="wm-back" onClick={()=>checkoutStep === 'delivery' ? setCheckoutStep(null) : setCheckoutStep(checkoutStep === 'payment' ? 'delivery' : 'payment')}>←</button>
          <div>
            <p className="eyebrow">Seu pedido</p>
            <h2>{checkoutStep === 'delivery' ? 'Entrega' : checkoutStep === 'payment' ? 'Pagamento' : 'Pedido pronto'}</h2>
          </div>
          <button className="wm-close" onClick={()=>setCheckoutStep(null)}>×</button>
        </div>

        <div className="wm-flow-progress">
          <span className={checkoutStep === 'delivery' ? 'active' : ''}>Entrega</span>
          <span className={checkoutStep === 'payment' ? 'active' : ''}>Pagamento</span>
          <span className={checkoutStep === 'review' ? 'active' : ''}>WhatsApp</span>
        </div>

        {checkoutStep === 'delivery' && <div className="wm-sheet-body">
          <div className="wm-checkout-list">
            {cart.map(i=><div className="wm-checkout-item" key={i.cart_id}>
              <div><strong>{i.quantity}x {i.product_name}</strong>{i.notes && <span>Obs: {i.notes}</span>}<small>{money(i.unit_price)} cada</small></div>
              <div className="qty-actions"><button onClick={()=>changeQty(i.cart_id,-1)}>-</button><b>{i.quantity}</b><button onClick={()=>changeQty(i.cart_id,1)}>+</button></div>
              <button className="wm-remove" onClick={()=>removeCartItem(i.cart_id)}>Remover</button>
            </div>)}
          </div>
          <div className="wm-delivery-choice">
            <button className={deliveryType === 'entrega' ? 'active' : ''} onClick={()=>setDeliveryType('entrega')}><strong>Entrega</strong><span>Receber no endereço</span></button>
            <button className={deliveryType === 'retirada' ? 'active' : ''} onClick={()=>setDeliveryType('retirada')}><strong>Retirada</strong><span>Buscar na loja</span></button>
          </div>
          <div className="delivery-form wm-delivery-form wm-sheet-form">
            <Field label="Nome"><input value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} placeholder="Seu nome"/></Field>
            <Field label="Telefone"><input value={form.customer_phone} onChange={e=>setForm({...form,customer_phone:e.target.value})} placeholder="Seu telefone"/></Field>
            {deliveryType === 'entrega' && <><Field label="Endereço"><input value={form.delivery_address} onChange={e=>setForm({...form,delivery_address:e.target.value})} placeholder="Rua, número e complemento"/></Field><Field label="Bairro"><input value={form.delivery_neighborhood} onChange={e=>setForm({...form,delivery_neighborhood:e.target.value})} placeholder="Bairro"/></Field><Field label="Referência"><input value={form.delivery_reference} onChange={e=>setForm({...form,delivery_reference:e.target.value})} placeholder="Ponto de referência"/></Field><Field label="Taxa de entrega"><input type="number" step="0.01" value={form.delivery_fee} onChange={e=>setForm({...form,delivery_fee:e.target.value})}/></Field></>}
            <Field label="Observação geral"><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Ex: troco, molho à parte, observações do pedido..."/></Field>
          </div>
          <div className="wm-sheet-summary"><Row a="Subtotal" b={money(subtotal)} /><Row a="Taxa de entrega" b={money(deliveryFee)} /><Row a="Total" b={money(total)} /></div>
          <Button className="full" onClick={()=>setCheckoutStep('payment')}>Ir para pagamento</Button>
        </div>}

        {checkoutStep === 'payment' && <div className="wm-sheet-body">
          <div className="wm-payment-options">
            {payMethods.filter(p=>['pix','debito','credito','dinheiro'].includes(p.value)).map(p=><button key={p.value} className={payment.method === p.value ? 'active' : ''} onClick={()=>setPayment({...payment,method:p.value})}><strong>{p.label}</strong><span>{p.value === 'pix' ? 'Chave Pix enviada pela loja' : p.value === 'dinheiro' ? 'Informe se precisa de troco' : 'Pagamento na entrega/retirada'}</span></button>)}
          </div>
          {payment.method === 'dinheiro' && <Field label="Troco para"><input type="number" step="0.01" value={payment.changeFor} onChange={e=>setPayment({...payment,changeFor:e.target.value})} placeholder="Ex: 100"/></Field>}
          <div className="wm-sheet-summary"><Row a="Subtotal" b={money(subtotal)} /><Row a="Taxa de entrega" b={money(deliveryFee)} /><Row a="Total" b={money(total)} /></div>
          <Button className="full" onClick={()=>setCheckoutStep('review')}>Finalizar pedido</Button>
        </div>}

        {checkoutStep === 'review' && <div className="wm-sheet-body">
          <div className="wm-review-card">
            <span>✅</span>
            <h3>Pedido montado</h3>
            <p>Confira o resumo e envie para o WhatsApp da Old Brother. A loja confirma o pedido por lá.</p>
          </div>
          <div className="wm-checkout-list compact-review">
            {cart.map(i=><div className="wm-checkout-item" key={i.cart_id}><div><strong>{i.quantity}x {i.product_name}</strong>{i.notes && <span>Obs: {i.notes}</span>}</div><b>{money(i.quantity*i.unit_price)}</b></div>)}
          </div>
          <div className="wm-sheet-summary"><Row a="Recebimento" b={deliveryType === 'entrega' ? 'Entrega' : 'Retirada'} /><Row a="Pagamento" b={paymentLabel} /><Row a="Total" b={money(total)} /></div>
          <Button className="full wm-whatsapp-button" onClick={openWhatsApp}>Enviar pedido no WhatsApp</Button>
          <Button variant="secondary" className="full" onClick={()=>setCheckoutStep('payment')}>Voltar e editar</Button>
        </div>}
      </section>
    </div>}
  </div>
}

function ProductsPage({ products, reload }) {
  const [categories,setCategories]=useState([]); const blank={name:'',category_id:'',price:0,description:'',available:true,prep_time_minutes:15,image_url:''}; const [form,setForm]=useState(blank), [editing,setEditing]=useState(null)
  useEffect(()=>{ api('/products/categories',{auth:false}).then(setCategories).catch(()=>{}) },[])
  const save=async()=>{ if(!form.name)return; const body={...form,price:Number(form.price),prep_time_minutes:Number(form.prep_time_minutes||15), image_url: form.image_url || null}; if(editing) await api(`/products/${editing}`,{method:'PUT',body:JSON.stringify(body)}); else await api('/products',{method:'POST',body:JSON.stringify(body)}); setForm(blank); setEditing(null); await reload() }
  const edit=p=>{ setEditing(p.id); setForm({name:p.name,category_id:p.category_id||'',price:p.price,description:p.description||'',available:p.available,prep_time_minutes:p.prep_time_minutes||15,image_url:p.image_url||''}) }
  return <div className="page"><div className="title"><p className="eyebrow">Administração</p><h1>Produtos</h1><p className="title-sub">Fotos por URL agora; Supabase Storage entra na etapa de deploy.</p></div><div className="grid-main"><Card><h3>{editing?'Editar produto':'Novo produto'}</h3><div className="form-grid"><Field label="Nome"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Categoria"><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Sem categoria</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Preço"><input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></Field><Field label="Tempo preparo"><input type="number" value={form.prep_time_minutes} onChange={e=>setForm({...form,prep_time_minutes:e.target.value})}/></Field><Field label="Imagem URL"><input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/></Field><Field label="Status"><select value={form.available?'true':'false'} onChange={e=>setForm({...form,available:e.target.value==='true'})}><option value="true">Disponível</option><option value="false">Indisponível</option></select></Field><Field label="Descrição"><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></Field></div><div className="actions"><Button onClick={save}>{editing?'Salvar':'Criar'}</Button>{editing&&<Button variant="secondary" onClick={()=>{setEditing(null);setForm(blank)}}>Cancelar</Button>}</div></Card><Card><h3>Produtos cadastrados</h3><div className="list">{products.map(p=><div className="list-item" key={p.id}><div><strong>{p.name}</strong><span>{p.category} • {money(p.price)} • {p.available?'Disponível':'Indisponível'}</span></div><div className="actions compact"><Button variant="secondary" onClick={()=>edit(p)}>Editar</Button><Button variant="danger" onClick={async()=>{await api(`/products/${p.id}`,{method:'DELETE'}); await reload()}}>Excluir</Button></div></div>)}</div></Card></div></div>
}

function StockPage({ stock, reload }) {
  const blank={name:'',category:'Insumos',quantity:0,unit:'unidade',minimum_quantity:0,unit_cost:0,supplier:''}; const [form,setForm]=useState(blank), [movement,setMovement]=useState({})
  const create=async()=>{ if(!form.name)return; await api('/stock',{method:'POST',body:JSON.stringify(form)}); setForm(blank); await reload() }
  const move=async(id)=>{ const m=movement[id]||{type:'entrada',quantity:1,reason:''}; await api(`/stock/${id}/movements`,{method:'POST',body:JSON.stringify(m)}); setMovement({...movement,[id]:{...m,quantity:1,reason:''}}); await reload() }
  return <div className="page"><div className="title"><p className="eyebrow">Estoque</p><h1>Controle de estoque</h1></div><div className="grid-main"><Card><h3>Novo item</h3><div className="form-grid">{Object.keys(blank).map(k=><Field key={k} label={k}><input type={['quantity','minimum_quantity','unit_cost'].includes(k)?'number':'text'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></Field>)}<Button onClick={create}>Adicionar item</Button></div></Card><Card><h3>Itens e movimentações</h3><div className="list">{stock.map(i=>{ const m=movement[i.id]||{type:'entrada',quantity:1,reason:''}; return <div className="list-item" key={i.id}><div><strong>{i.name} {i.low_stock && <Pill type="danger">Baixo</Pill>}</strong><span>{i.qty} {i.unit} • mínimo {i.min} • custo {money(i.cost)}</span><div className="actions compact"><select value={m.type} onChange={e=>setMovement({...movement,[i.id]:{...m,type:e.target.value}})}><option>entrada</option><option>saida</option><option>perda</option><option>ajuste</option><option>producao</option></select><input type="number" value={m.quantity} onChange={e=>setMovement({...movement,[i.id]:{...m,quantity:e.target.value}})}/><input placeholder="Motivo" value={m.reason} onChange={e=>setMovement({...movement,[i.id]:{...m,reason:e.target.value}})}/><Button onClick={()=>move(i.id)}>Registrar</Button></div></div><Button variant="danger" onClick={async()=>{await api(`/stock/${i.id}`,{method:'DELETE'}); await reload()}}>Desativar</Button></div>})}</div></Card></div></div>
}

function UsersPage({ users, user, reload }) {
  const blank = { name: '', email: '', pin: '', role: 'garcom', active: true }
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const resetForm = () => {
    setEditing(null)
    setForm(blank)
    setMessage('')
  }

  const startEdit = (selectedUser) => {
    setEditing(selectedUser.id)
    setMessage('')
    setForm({
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      pin: '',
      role: selectedUser.role || 'garcom',
      active: selectedUser.active !== false,
    })
  }

  const save = async () => {
    if (!form.name.trim()) {
      setMessage('Informe o nome do usuário.')
      return
    }

    if (!editing && !form.pin.trim()) {
      setMessage('Informe um PIN para criar o usuário.')
      return
    }

    setBusy(true)
    setMessage('')

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        role: form.role,
        active: form.active,
      }

      if (form.pin.trim()) payload.pin = form.pin.trim()

      if (editing) {
        await api(`/users/${editing}`, { method: 'PUT', body: JSON.stringify(payload) })
        setMessage('Usuário atualizado com sucesso.')
      } else {
        await api('/users', { method: 'POST', body: JSON.stringify(payload) })
        setMessage('Usuário criado com sucesso.')
      }

      setForm(blank)
      setEditing(null)
      await reload()
    } catch (err) {
      setMessage(err.message || 'Erro ao salvar usuário.')
    } finally {
      setBusy(false)
    }
  }

  const changeActive = async (selectedUser, active) => {
    if (selectedUser.id === user.id && !active) {
      setMessage('Você não pode desativar o próprio usuário logado.')
      return
    }

    setBusy(true)
    setMessage('')

    try {
      await api(`/users/${selectedUser.id}`, { method: 'PUT', body: JSON.stringify({ active }) })
      setMessage(active ? 'Usuário reativado com sucesso.' : 'Usuário desativado com sucesso.')
      await reload()
    } catch (err) {
      setMessage(err.message || 'Erro ao alterar status do usuário.')
    } finally {
      setBusy(false)
    }
  }

  const removePermanent = async (selectedUser) => {
    if (selectedUser.id === user.id) {
      setMessage('Você não pode excluir o próprio usuário logado.')
      return
    }

    const confirmed = window.confirm(`Excluir definitivamente o usuário ${selectedUser.name}? Essa ação não pode ser desfeita.`)
    if (!confirmed) return

    setBusy(true)
    setMessage('')

    try {
      await api(`/users/${selectedUser.id}/permanent`, { method: 'DELETE' })
      setMessage('Usuário excluído definitivamente.')
      if (editing === selectedUser.id) resetForm()
      await reload()
    } catch (err) {
      setMessage(err.message || 'Não foi possível excluir o usuário.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="page">
    <div className="title">
      <p className="eyebrow">Administração</p>
      <h1>Usuários e permissões</h1>
      <p className="title-sub">Cadastre, edite cargos, desative, reative ou exclua perfis do sistema.</p>
    </div>

    {message && <p className="error">{message}</p>}

    <div className="grid-main">
      <Card>
        <h3>{editing ? 'Editar usuário' : 'Novo usuário'}</h3>
        <div className="form-grid">
          <Field label="Nome"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="E-mail"><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label={editing ? 'Novo PIN opcional' : 'PIN'}><input value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} /></Field>
          <Field label="Perfil">
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {roles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.active ? 'true' : 'false'} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>
        </div>
        <div className="actions">
          <Button disabled={busy} onClick={save}>{editing ? 'Salvar alterações' : 'Criar usuário'}</Button>
          {editing && <Button disabled={busy} variant="secondary" onClick={resetForm}>Cancelar edição</Button>}
        </div>
      </Card>

      <Card>
        <h3>Usuários cadastrados</h3>
        <div className="list">
          {users.map(u => <div className="list-item" key={u.id}>
            <div>
              <strong>{u.name} {u.id === user.id && <Pill type="gold">Você</Pill>}</strong>
              <span>{u.email || 'sem e-mail'} • {roleLabels[u.role] || u.role}</span>
              <span><Pill type={u.active ? 'gold' : 'danger'}>{u.active ? 'Ativo' : 'Inativo'}</Pill></span>
            </div>
            <div className="actions compact">
              <Button disabled={busy} variant="secondary" onClick={() => startEdit(u)}>Editar</Button>
              {u.active
                ? <Button disabled={busy || u.id === user.id} variant="danger" onClick={() => changeActive(u, false)}>Desativar</Button>
                : <Button disabled={busy} onClick={() => changeActive(u, true)}>Reativar</Button>}
              <Button disabled={busy || u.id === user.id} variant="danger" onClick={() => removePermanent(u)}>Excluir</Button>
            </div>
          </div>)}
          {!users.length && <p className="muted">Nenhum usuário cadastrado.</p>}
        </div>
      </Card>
    </div>
  </div>
}
function QRCodesPage({ tables }) { const download=id=>{const c=document.getElementById(`qr-${id}`); const a=document.createElement('a'); a.download=`qr-${id}.png`; a.href=c.toDataURL('image/png'); a.click()}; return <div className="page"><div className="title"><p className="eyebrow">QR Code</p><h1>QR Codes das mesas</h1></div><div className="qr-grid">{tables.map(t=>{const url=`${location.origin}/#/cardapio/mesa/${t.id}`; return <Card className="qr-card" key={t.id}><h3>{t.name}</h3><QRCodeCanvas id={`qr-${t.id}`} value={url} size={180}/><small>{url}</small><div className="actions"><Button onClick={()=>download(t.id)}>Baixar PNG</Button><Button variant="secondary" onClick={()=>window.open(url,'_blank')}>Abrir</Button></div></Card>})}</div></div> }
function ReportsPage({ orders }) { const [from,setFrom]=useState(''), [to,setTo]=useState(''); const exportExcel=async()=>{ const qs=new URLSearchParams(); if(from)qs.set('from',from); if(to)qs.set('to',to); const token=localStorage.getItem('ob.api.token'); const res=await fetch(`${API_BASE}/reports/sales/export.xlsx?${qs}`,{headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) throw new Error('Erro ao exportar Excel'); downloadBlob(await res.blob(),'relatorio-old-brother.xlsx') }; return <div className="page"><div className="title"><p className="eyebrow">Relatórios</p><h1>Exportações e auditoria</h1></div><Card><h3>Exportar faturamento em Excel</h3><div className="toolbar"><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><Button onClick={exportExcel}>Exportar Excel</Button></div></Card><Card><h3>Cancelamentos</h3>{orders.filter(o=>o.status==='cancelado').map(o=><Row key={o.id} a={`#${orderNumber(o.order_number)} • ${originLabel(o.origin)}`} b="Cancelado"/>)}{!orders.filter(o=>o.status==='cancelado').length && <p className="muted">Nenhum cancelamento.</p>}</Card></div> }

function CustomerTablePage({ tableId, tables, products, reload }) {
  const table = tables.find(t=>String(t.id)===String(tableId)); const [name,setName]=useState(''), [people,setPeople]=useState(2), [starting,setStarting]=useState(false), [error,setError]=useState('')
  const start=async()=>{ if(!table||table.status!=='livre'||!name.trim()) return; setStarting(true); setError(''); try{ await api(`/tables/${tableId}/open-session`,{method:'POST',auth:false,body:JSON.stringify({customer_name:name,people})}); await reload() }catch(err){ setError(err.message) }finally{ setStarting(false) } }
  return <main className="customer"><div className="customer-head"><div><p className="eyebrow">Old Brother</p><h1>Cardápio digital</h1></div><Pill type={table?.status}>{table ? statusLabel(table.status) : 'Carregando'}</Pill></div>{!table ? <Card>Carregando mesa...</Card> : <Card className="customer-start-card"><div className="section-head"><div><h2>{table.name}</h2><p className="muted">Inicie o atendimento para vincular esta mesa ao painel.</p></div><Pill type={table.status}>{statusLabel(table.status)}</Pill></div>{table.status==='livre' ? <><div className="customer-form-grid"><Field label="Seu nome"><input value={name} onChange={e=>setName(e.target.value)} /></Field><Field label="Pessoas"><input type="number" min="1" value={people} onChange={e=>setPeople(e.target.value)} /></Field><Button className="customer-submit" disabled={starting||!name.trim()} onClick={start}>{starting?'Iniciando...':'Iniciar atendimento'}</Button></div>{error&&<p className="error">{error}</p>}</> : <div className="notice"><b>Essa mesa já está em atendimento.</b><span>Chame um garçom se precisar de ajuda.</span></div>}</Card>}<MenuPage products={products} deliveryMode={false}/></main>
}
