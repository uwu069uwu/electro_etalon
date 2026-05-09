import City from "../models/City.js";

export const getCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ detail: "Ошибка" });
  }
};

export const createCity = async (req, res) => {
  try {
    const { name, isFreeDelivery } = req.body;
    const city = await City.create({ name, isFreeDelivery: !!isFreeDelivery, districts: [] });
    res.json(city);
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
};

export const updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!city) return res.status(404).json({ detail: "Не найден" });
    res.json(city);
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    await City.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// Districts
export const addDistrict = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ detail: "Город не найден" });
    city.districts.push({ name: req.body.name });
    await city.save();
    res.json(city);
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
};

export const deleteDistrict = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ detail: "Город не найден" });
    city.districts = city.districts.filter(
      (d) => d._id.toString() !== req.params.districtId
    );
    await city.save();
    res.json(city);
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
};
