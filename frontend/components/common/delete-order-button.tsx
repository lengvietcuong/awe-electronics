'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteOrderAction } from '@/lib/actions/admin-orders'

interface DeleteOrderButtonProps {
  orderId: number
}

export function DeleteOrderButton({ orderId }: DeleteOrderButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteOrderAction(orderId)

    if (result.success) {
      alert('Order deleted successfully')
      // Wait 1 second before refreshing to show the success message
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } else {
      alert(result.error || 'Failed to delete order')
    }

    setIsDeleting(false)
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="cursor-pointer"
        >
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="cursor-pointer"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowConfirm(true)}
      disabled={isDeleting}
      className="cursor-pointer"
    >
      <Trash2 className="h-4 w-4 text-white" />
    </Button>
  )
}
