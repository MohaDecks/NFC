import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Country = { id: string; name: string; flag?: string; status: string };
type City = { id: string; name: string; status: string; countyId: string };

export function LocationSelect({
  countryId,
  cityId,
  onChange,
}: {
  countryId?: string | null;
  cityId?: string | null;
  onChange: (next: { countryId: string; cityId: string; country: string; city: string }) => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  useEffect(() => {
    void api.get<{ countries?: Country[]; counties: Country[] }>("/api/admin/countries").then((data) => {
      setCountries((data.countries ?? data.counties).filter((item) => item.status !== "INACTIVE"));
    });
  }, []);

  useEffect(() => {
    if (!countryId) {
      setCities([]);
      return;
    }
    void api.get<{ cities: City[] }>(`/api/admin/countries/${countryId}/cities`).then((data) => {
      setCities(data.cities.filter((item) => item.status !== "INACTIVE"));
    });
  }, [countryId]);

  const selectedCountry = countries.find((item) => item.id === countryId);
  const selectedCity = cities.find((item) => item.id === cityId);
  const filteredCountries = useMemo(
    () => countries.filter((item) => item.name.toLowerCase().includes(countryQuery.toLowerCase())),
    [countries, countryQuery],
  );
  const filteredCities = useMemo(
    () => cities.filter((item) => item.name.toLowerCase().includes(cityQuery.toLowerCase())),
    [cities, cityQuery],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="relative space-y-2">
        <Label>Country</Label>
        <Input
          value={openCountry ? countryQuery : selectedCountry ? `${selectedCountry.flag ? `${selectedCountry.flag} ` : ""}${selectedCountry.name}` : countryQuery}
          onChange={(e) => {
            setCountryQuery(e.target.value);
            setOpenCountry(true);
          }}
          onFocus={() => {
            setCountryQuery("");
            setOpenCountry(true);
          }}
          placeholder="Search country"
        />
        {openCountry && (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border bg-white shadow-lg">
            {filteredCountries.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => {
                  onChange({ countryId: item.id, cityId: "", country: item.name, city: "" });
                  setOpenCountry(false);
                  setCountryQuery("");
                }}
              >
                <span>{item.flag}</span>
                <span>{item.name}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No countries</p>}
          </div>
        )}
      </div>
      <div className="relative space-y-2">
        <Label>City</Label>
        <Input
          disabled={!countryId}
          value={openCity ? cityQuery : selectedCity?.name ?? cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setOpenCity(true);
          }}
          onFocus={() => {
            setCityQuery("");
            setOpenCity(true);
          }}
          placeholder={countryId ? "Search city" : "Select a country first"}
        />
        {openCity && countryId && (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border bg-white shadow-lg">
            {filteredCities.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => {
                  onChange({
                    countryId: countryId,
                    cityId: item.id,
                    country: selectedCountry?.name ?? "",
                    city: item.name,
                  });
                  setOpenCity(false);
                  setCityQuery("");
                }}
              >
                {item.name}
              </button>
            ))}
            {filteredCities.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No cities for this country</p>}
          </div>
        )}
      </div>
    </div>
  );
}
