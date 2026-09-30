import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { TextArea } from "../ui/Field";
import { ListingRow } from "./ListingRow";
import { SOURCES } from "../../lib/sources";
import type { Listing, Notes, Phase, Plan } from "../../lib/types";

interface Props {
  plan: Plan;
  phase: Phase;
  notes: Notes;
  firstMarketplace: boolean;
  onToggleCheck: (key: string) => void;
  onListingChange: (index: number, patch: Partial<Listing>) => void;
  onAddListing: () => void;
  onRemoveListing: (index: number) => void;
  onNotesField: (path: string, value: unknown) => void;
}

export function MarketplacePhase({
  phase,
  notes,
  firstMarketplace,
  onToggleCheck,
  onListingChange,
  onAddListing,
  onRemoveListing,
  onNotesField,
}: Props) {
  const keywords = notes.keywords
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const listings = notes.listingLogs[phase.id] ?? [];

  return (
    <>
      <ul className="list-none mt-4 p-0 grid gap-2">
        {phase.checks.map((c, j) => {
          const key = `${phase.id}c${j}`;
          return (
            <li key={key}>
              <label className="flex gap-2.5 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!notes.checks[key]}
                  onChange={() => onToggleCheck(key)}
                  className="mt-0.5 w-4.5 h-4.5 shrink-0 accent-p4"
                />
                <span>{c}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {keywords.length === 0 ? (
        <p className="text-sm text-muted mt-4">
          Add keywords in the plan setup to get search links.
        </p>
      ) : (
        phase.sources.map((sid) => {
          const src = SOURCES[sid];
          if (!src) return null;
          return (
            <div key={sid} className="flex flex-wrap items-center gap-2 mt-4">
              <span className="font-semibold text-sm mr-1">
                Search {src.label} for
              </span>
              {keywords.map((k) => (
                <Chip key={k} label={k} href={src.url(encodeURIComponent(k))} />
              ))}
            </div>
          );
        })
      )}

      <div className="mt-4">
        {listings.map((l, i) => (
          <ListingRow
            key={i}
            index={i}
            listing={l}
            onChange={(patch) => onListingChange(i, patch)}
            onRemove={() => onRemoveListing(i)}
          />
        ))}
      </div>
      <Button variant="ghost" className="mt-1" onClick={onAddListing}>
        Add a listing
      </Button>

      {firstMarketplace && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <TextArea
            id="complaints"
            label="Complaints that repeat in 2 and 3 star reviews"
            placeholder="Add complaints from other marketplaces here too"
            value={notes.complaints}
            onChange={(e) => onNotesField("complaints", e.target.value)}
          />
          <TextArea
            id="wishes"
            label="Features people wished for"
            placeholder="I wish it had..."
            value={notes.wishes}
            onChange={(e) => onNotesField("wishes", e.target.value)}
          />
        </div>
      )}
    </>
  );
}
