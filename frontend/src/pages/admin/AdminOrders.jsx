import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import API, { fileUrl } from "../../api/axios";

const STATUSES = [
  { value: "new", label: "Новый", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { value: "delivered", label: "Доставлен", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { value: "cancelled", label: "Отменён", color: "bg-destructive/10 text-destructive" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    const { data } = await API.get("/orders");
    setOrders(data);
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      toast.success("Статус обновлён");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка");
    }
  };

  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Админ</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Заказы</h1>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        <FilterPill
          label="Все"
          count={counts.all}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {STATUSES.map((s) => (
          <FilterPill
            key={s.value}
            label={s.label}
            count={counts[s.value] || 0}
            active={filter === s.value}
            onClick={() => setFilter(s.value)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          0
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const st = STATUSES.find((s) => s.value === o.status);
            const isOpen = expanded === o._id;
            return (
              <div
                key={o._id}
                className="rounded-2xl border border-border bg-card overflow-hidden"
                data-testid={`admin-order-row-${o._id}`}
              >
                <div
                  className="p-4 sm:p-5 cursor-pointer hover:bg-muted/30 transition"
                  onClick={() => setExpanded(isOpen ? null : o._id)}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-muted-foreground">
                          #{o._id.slice(0, 8)}
                        </div>
                        <div className="font-medium truncate">{o.customer_name}</div>
                      </div>
                      <div className="hidden sm:block text-sm text-muted-foreground truncate">
                        {o.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st?.color || "bg-muted text-muted-foreground"}`}>
                        {st?.label || o.status}
                      </span>
                      <div className="font-display text-base sm:text-lg font-semibold">
                        {(o.total || 0).toLocaleString("ru-RU")} ₸
                      </div>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border p-4 sm:p-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <InfoLine label="Email" value={o.email} />
                      <InfoLine label="Телефон" value={o.phone || "—"} />
                      <InfoLine label="Адрес" value={o.address} />
                      <InfoLine label="Создан" value={new Date(o.created_at || o.createdAt).toLocaleString("ru-RU")} />
                      {o.comment && (
                        <div className="sm:col-span-2">
                          <InfoLine label="Комментарий" value={o.comment} />
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border overflow-x-auto">
                      <table className="w-full text-sm min-w-[400px]">
                        <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground bg-muted/30">
                          <tr>
                            <th className="text-left font-medium py-2.5 px-3">Товар</th>
                            <th className="text-right font-medium py-2.5 px-3">Цена</th>
                            <th className="text-right font-medium py-2.5 px-3">Кол-во</th>
                            <th className="text-right font-medium py-2.5 px-3">Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(o.items || []).map((it, i) => (
                            <tr key={`${it.product_id}-${it.color || "_"}-${i}`} className="border-b border-border/60 last:border-0">
                              <td className="py-2.5 px-3">
                                <div className="font-medium">{it.name}</div>
                                {it.color && (
                                  <span className="text-xs text-muted-foreground">{it.color}</span>
                                )}
                                {it.brand && (
                                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{it.brand}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{(it.price || 0).toLocaleString("ru-RU")} ₸</td>
                              <td className="py-2.5 px-3 text-right">{it.qty}</td>
                              <td className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                                {((it.price || 0) * it.qty).toLocaleString("ru-RU")} ₸
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {o.discount_amount > 0 && (
                        <div className="border-t border-border px-3 py-3 text-sm space-y-1">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Сумма</span>
                            <span>{(o.subtotal || 0).toLocaleString("ru-RU")} ₸</span>
                          </div>
                          <div className="flex justify-between text-primary font-medium">
                            <span>Скидка {o.discount_percent || 5}%</span>
                            <span>−{(o.discount_amount || 0).toLocaleString("ru-RU")} ₸</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-1 border-t border-border">
                            <span>Итого</span>
                            <span>{(o.total || 0).toLocaleString("ru-RU")} ₸</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status change buttons — only allowed transitions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {STATUSES.filter((s) => s.value !== o.status).map((s) => (
                        <button
                          key={s.value}
                          onClick={() => changeStatus(o._id, s.value)}
                          data-testid={`admin-order-status-${s.value}-${o._id}`}
                          className="h-9 px-4 rounded-full border border-border text-sm hover:bg-muted transition"
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const FilterPill = ({ label, count, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
      active ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/70"
    }`}
  >
    {label}
    <span className={`text-xs rounded-full px-1.5 min-w-[20px] text-center ${active ? "bg-background/20" : "bg-background dark:bg-neutral-800"}`}>
      {count}
    </span>
  </button>
);

const InfoLine = ({ label, value }) => (
  <div>
    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
    <div className="break-words">{value}</div>
  </div>
);
