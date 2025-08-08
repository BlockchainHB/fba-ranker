"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProofDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: string
  proofDataUrl?: string
}

export function ProofDialog({ open, onOpenChange, title = "Proof", proofDataUrl }: ProofDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {proofDataUrl ? (
          <div className="relative w-full overflow-hidden rounded-md border">
            <Image
              src={proofDataUrl || "/placeholder.svg"}
              width={1200}
              height={800}
              alt="Submitted proof"
              className="h-auto w-full"
            />
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No proof uploaded.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
