import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import useAuth from "@/hooks/useAuth";

interface NewShipmentDialogProps {
  type: "import" | "export";
  onSuccess?: () => void;
}

export function NewShipmentDialog({ type, onSuccess }: NewShipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    reference_number: "",
    origin_country: "",
    destination_country: "",
    estimated_value: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("shipments").insert([
        {
          type,
          reference_number: formData.reference_number,
          origin_country: formData.origin_country,
          destination_country: formData.destination_country,
          estimated_value: parseFloat(formData.estimated_value),
          status: "draft",
          created_by: user?.id,
        },
      ]);

      if (error) throw error;

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating shipment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          New {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Create New {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={formData.reference_number}
              onChange={(e) =>
                setFormData({ ...formData, reference_number: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin">Origin Country</Label>
            <Input
              id="origin"
              value={formData.origin_country}
              onChange={(e) =>
                setFormData({ ...formData, origin_country: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Country</Label>
            <Input
              id="destination"
              value={formData.destination_country}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  destination_country: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Estimated Value</Label>
            <Input
              id="value"
              type="number"
              value={formData.estimated_value}
              onChange={(e) =>
                setFormData({ ...formData, estimated_value: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
