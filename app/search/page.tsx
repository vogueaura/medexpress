"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, ChevronDown,
  Grid3X3, List, SearchX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MedicineCard, { MedicineCardSkeleton } from "@/components/cards/MedicineCard";
import EmptyState from "@/components/ui/EmptyState";
import { medicines } from "@/data/medicines";
import { categories } from "@/data/categories";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [priceRange, setPriceRange] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredMedicines = useMemo(() => {
    let result = [...medicines];

    // Search query
    if (query) {
      const lower = query.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(lower) ||
          m.genericName.toLowerCase().includes(lower) ||
          m.manufacturer.toLowerCase().includes(lower) ||
          m.category.toLowerCase().includes(lower)
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      result = result.filter((m) => selectedCategories.includes(m.category));
    }

    // Price range
    if (priceRange === "under-5") result = result.filter((m) => m.price < 5);
    else if (priceRange === "5-10") result = result.filter((m) => m.price >= 5 && m.price <= 10);
    else if (priceRange === "10-20") result = result.filter((m) => m.price >= 10 && m.price <= 20);
    else if (priceRange === "over-20") result = result.filter((m) => m.price > 20);

    // Availability
    if (availability === "in-stock") result = result.filter((m) => m.availability === "in-stock");
    else if (availability === "prescription") result = result.filter((m) => m.prescriptionRequired);

    // Sort
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [query, selectedCategories, priceRange, availability, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange("all");
    setAvailability("all");
    setQuery("");
  };

  const activeFilterCount =
    selectedCategories.length +
    (priceRange !== "all" ? 1 : 0) +
    (availability !== "all" ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Categories</h4>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer flex-1">
                {cat.name}
              </Label>
              <span className="text-xs text-muted-foreground">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Price Range</h4>
        <div className="space-y-2.5">
          {[
            { value: "all", label: "All Prices" },
            { value: "under-5", label: "Under $5" },
            { value: "5-10", label: "$5 - $10" },
            { value: "10-20", label: "$10 - $20" },
            { value: "over-20", label: "Over $20" },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center gap-2.5">
              <Checkbox
                id={`price-${opt.value}`}
                checked={priceRange === opt.value}
                onCheckedChange={() => setPriceRange(opt.value)}
              />
              <Label htmlFor={`price-${opt.value}`} className="text-sm cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Availability</h4>
        <div className="space-y-2.5">
          {[
            { value: "all", label: "All" },
            { value: "in-stock", label: "In Stock Only" },
            { value: "prescription", label: "Prescription Required" },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center gap-2.5">
              <Checkbox
                id={`avail-${opt.value}`}
                checked={availability === opt.value}
                onCheckedChange={() => setAvailability(opt.value)}
              />
              <Label htmlFor={`avail-${opt.value}`} className="text-sm cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full rounded-xl" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-medical-soft border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Search Medicines</h1>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, generic name, or manufacturer..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-4 h-12 rounded-2xl text-base bg-background/80 backdrop-blur-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="lg:hidden rounded-xl gap-2" />}>
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredMedicines.length}</span> products found
            </p>
          </div>

          {/* Active filters pills */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {selectedCategories.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              return cat ? (
                <Badge
                  key={catId}
                  variant="secondary"
                  className="rounded-full gap-1 cursor-pointer hover:bg-destructive/10"
                  onClick={() => toggleCategory(catId)}
                >
                  {cat.name}
                  <X className="w-3 h-3" />
                </Badge>
              ) : null;
            })}
          </div>

          <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Best Rating</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl border border-border/50 p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold">Filters</h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredMedicines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredMedicines.map((medicine, i) => (
                  <MedicineCard key={medicine.id} medicine={medicine} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No Medicines Found"
                description="Try adjusting your search or filter criteria to find what you're looking for."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <MedicineCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
