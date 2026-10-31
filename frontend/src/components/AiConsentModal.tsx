import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Form';
import { Modal } from './ui/Modal';

/**
 * Explicit, informed consent before personal text is processed by an external AI provider.
 */
export function AiConsentModal({ open, onClose, onAccept }: { open: boolean; onClose: () => void; onAccept: () => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <Modal
      open={open}
      title="Persetujuan pemrosesan oleh AI"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button disabled={!checked} onClick={onAccept}>Setuju & lanjutkan</Button>
        </>
      }
    >
      <p>Untuk memberikan jawaban dan umpan balik, teks yang kamu kirim (beserta ringkasan hasil refleksi dan profil karier jika ada) akan diproses oleh penyedia layanan AI pihak ketiga melalui server kami.</p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>Jangan menuliskan data sensitif seperti NIK, nomor rekening, atau informasi kesehatan.</li>
        <li>Kami tidak menggunakan datamu untuk tujuan lain tanpa persetujuanmu. Jika layanan memakai paket AI gratis, penyedia AI dapat menggunakan data yang dikirim untuk meningkatkan layanannya.</li>
        <li>Kamu dapat mencabut persetujuan dan menghapus datamu kapan saja di halaman Profil.</li>
      </ul>
      <div className="mt-4">
        <Checkbox checked={checked} onChange={setChecked}>
          Saya memahami dan menyetujui pemrosesan data oleh layanan AI sesuai <Link to="/privasi" target="_blank" className="font-semibold text-primary underline">Kebijakan Privasi</Link>.
        </Checkbox>
      </div>
    </Modal>
  );
}
