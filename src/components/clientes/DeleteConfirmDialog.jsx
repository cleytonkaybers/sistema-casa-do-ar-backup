import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, clienteName, isLoading }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center">Excluir Cliente</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Tem certeza que deseja excluir o cliente <strong>{clienteName}</strong>? 
            Esta ação não pode ser desfeita e todos os atendimentos relacionados serão mantidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3">
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}