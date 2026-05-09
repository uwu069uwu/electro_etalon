import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronRight, MapPin, Check } from "lucide-react";
import API from "../../api/axios";

export default function AdminCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // New city form
  const [newCityName, setNewCityName] = useState("");
  const [newCityFree, setNewCityFree] = useState(false);
  const [addingCity, setAddingCity] = useState(false);

  // New district inputs per city
  const [districtInputs, setDistrictInputs] = useState({});

  const load = async () => {
    try {
      const { data } = await API.get("/cities");
      setCities(data);
    } catch {
      toast.error("Ошибка загрузки городов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addCity = async () => {
    if (!newCityName.trim()) return toast.error("Введите название города");
    setAddingCity(true);
    try {
      await API.post("/cities", { name: newCityName.trim(), isFreeDelivery: newCityFree });
      setNewCityName("");
      setNewCityFree(false);
      await load();
      toast.success("Город добавлен");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка");
    } finally {
      setAddingCity(false);
    }
  };

  const deleteCity = async (id) => {
    if (!window.confirm("Удалить город со всеми районами?")) return;
    try {
      await API.delete(`/cities/${id}`);
      await load();
      toast.success("Город удалён");
    } catch {
      toast.error("Ошибка");
    }
  };

  const toggleFree = async (city) => {
    try {
      await API.put(`/cities/${city._id}`, { isFreeDelivery: !city.isFreeDelivery });
      await load();
    } catch {
      toast.error("Ошибка");
    }
  };

  const addDistrict = async (cityId) => {
    const name = (districtInputs[cityId] || "").trim();
    if (!name) return toast.error("Введите название района");
    try {
      await API.post(`/cities/${cityId}/districts`, { name });
      setDistrictInputs((p) => ({ ...p, [cityId]: "" }));
      await load();
      toast.success("Район добавлен");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Ошибка");
    }
  };

  const deleteDistrict = async (cityId, districtId) => {
    try {
      await API.delete(`/cities/${cityId}/districts/${districtId}`);
      await load();
      toast.success("Район удалён");
    } catch {
      toast.error("Ошибка");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Админ</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Города и районы</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Добавьте города доставки и их районы. Клиент выбирает их при оформлении заказа.
        </p>
      </div>

      {/* Add city form */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6">
        <div className="text-sm font-semibold mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          Добавить город
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCity()}
            placeholder="Название города (напр. Астана)"
            className="flex-1 h-11 rounded-xl border border-border bg-input px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {/* Free delivery toggle */}
          <button
            type="button"
            onClick={() => setNewCityFree((v) => !v)}
            className={`h-11 px-4 rounded-xl border text-sm font-medium whitespace-nowrap flex items-center gap-2 transition ${
              newCityFree
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {newCityFree && <Check size={13} />}
            Бесплатная доставка
          </button>
          <button
            onClick={addCity}
            disabled={addingCity}
            className="h-11 px-5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-50 inline-flex items-center gap-2 transition"
          >
            <Plus size={14} />
            Добавить
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Если «бесплатная доставка» выключена — клиенту покажется «договорная», менеджер уточнит стоимость.
        </p>
      </div>

      {/* City list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl skeleton" />
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Городов пока нет. Добавьте первый выше.
        </div>
      ) : (
        <div className="space-y-3">
          {cities.map((city) => {
            const isOpen = expanded === city._id;
            return (
              <div key={city._id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* City row */}
                <div className="flex items-center gap-3 p-4 sm:p-5">
                  <button
                    onClick={() => setExpanded(isOpen ? null : city._id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    {isOpen
                      ? <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
                      : <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                    }
                    <span className="font-medium">{city.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {city.districts.length > 0
                        ? `${city.districts.length} район${city.districts.length === 1 ? "" : city.districts.length < 5 ? "а" : "ов"}`
                        : "районы не добавлены"}
                    </span>
                  </button>

                  {/* Free delivery toggle */}
                  <button
                    onClick={() => toggleFree(city)}
                    className={`shrink-0 h-8 px-3 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      city.isFreeDelivery
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {city.isFreeDelivery ? <Check size={11} /> : null}
                    {city.isFreeDelivery ? "Бесплатно" : "Договорная"}
                  </button>

                  <button
                    onClick={() => deleteCity(city._id)}
                    className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Districts panel */}
                {isOpen && (
                  <div className="border-t border-border p-4 sm:p-5 space-y-4 bg-muted/20">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Районы
                    </div>

                    {/* District list */}
                    {city.districts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Районов нет — клиент сразу вводит улицу. Добавьте если нужно.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {city.districts.map((d) => (
                          <span
                            key={d._id}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-background border border-border text-sm"
                          >
                            {d.name}
                            <button
                              onClick={() => deleteDistrict(city._id, d._id)}
                              className="text-muted-foreground hover:text-destructive transition ml-0.5"
                            >
                              <Trash2 size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add district input */}
                    <div className="flex gap-2">
                      <input
                        value={districtInputs[city._id] || ""}
                        onChange={(e) =>
                          setDistrictInputs((p) => ({ ...p, [city._id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && addDistrict(city._id)}
                        placeholder="Название района..."
                        className="flex-1 h-9 rounded-xl border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={() => addDistrict(city._id)}
                        className="h-9 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-80 transition inline-flex items-center gap-1.5"
                      >
                        <Plus size={13} />
                        Добавить
                      </button>
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
