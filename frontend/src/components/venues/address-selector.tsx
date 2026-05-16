'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getProvinces,
  findProvince,
  findDistrict,
  findWard,
  convertOldToNew,
  type VnProvince,
} from '@/lib/vn-address';

export interface AddressValue {
  /** User-facing city — tỉnh/TP cũ hoặc mới tuỳ mode */
  city: string;
  /** Chỉ có ở mode 'old' */
  district?: string;
  /** Xã/phường */
  ward?: string;
  /** Địa chỉ mới (auto-convert nếu mode 'old', user pick trực tiếp nếu mode 'new') */
  newCity?: string;
  newWard?: string;
  provinceCode?: string;
  wardCode?: string;
}

interface Props {
  mode: 'old' | 'new';
  value: AddressValue;
  onChange: (next: AddressValue) => void;
}

/**
 * Cascading select cho địa chỉ Việt Nam.
 *
 * - Mode 'old': Tỉnh → Quận/Huyện → Xã/Phường (3 dropdown). Auto-convert sang format mới khi đủ.
 * - Mode 'new': Tỉnh → Xã/Phường (2 dropdown, flatten qua quận/huyện).
 */
export function AddressSelector({ mode, value, onChange }: Props) {
  const [provinces, setProvinces] = useState<VnProvince[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provinceCode, setProvinceCode] = useState<string>(value.provinceCode ?? '');
  const [districtCode, setDistrictCode] = useState<string>('');
  const [wardCode, setWardCode] = useState<string>(value.wardCode ?? '');

  useEffect(() => {
    let cancelled = false;
    getProvinces()
      .then((data) => !cancelled && setProvinces(data))
      .catch(() => !cancelled && setError('Không tải được danh sách tỉnh/thành. Thử lại sau.'));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!provinces) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải danh sách hành chính...
      </div>
    );
  }

  const province = findProvince(provinces, provinceCode);
  const district = findDistrict(province, districtCode);

  // Tạo flat list xã/phường khi mode='new' (gộp qua tất cả quận/huyện của tỉnh)
  const flatWards =
    mode === 'new' && province
      ? province.districts.flatMap((d) =>
          d.wards.map((w) => ({
            ...w,
            districtName: d.name,
          })),
        )
      : [];

  function pickProvince(code: string) {
    setProvinceCode(code);
    setDistrictCode('');
    setWardCode('');
    const p = findProvince(provinces!, code);
    onChange({
      ...value,
      city: p?.name ?? '',
      district: undefined,
      ward: undefined,
      newCity: p?.name,
      newWard: undefined,
      provinceCode: code,
      wardCode: undefined,
    });
  }

  function pickDistrict(code: string) {
    setDistrictCode(code);
    setWardCode('');
    const d = findDistrict(province, code);
    onChange({
      ...value,
      district: d?.name ?? '',
      ward: undefined,
      wardCode: undefined,
    });
  }

  function pickWardOld(code: string) {
    setWardCode(code);
    const w = findWard(district, code);
    if (!w || !province || !district) return;
    const conv = convertOldToNew(province, district, w);
    onChange({
      city: province.name,
      district: district.name,
      ward: w.name,
      ...conv,
    });
  }

  function pickWardNew(code: string) {
    setWardCode(code);
    const flat = flatWards.find((w) => String(w.code) === code);
    if (!flat || !province) return;
    onChange({
      city: province.name,
      ward: flat.name,
      district: undefined,
      newCity: province.name,
      newWard: flat.name,
      provinceCode: String(province.code),
      wardCode: code,
    });
  }

  return (
    <div className={mode === 'old' ? 'grid gap-4 md:grid-cols-3' : 'grid gap-4 md:grid-cols-2'}>
      <Field label="Tỉnh / Thành phố" required>
        <Select value={provinceCode} onChange={pickProvince} placeholder="Chọn tỉnh/TP">
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>

      {mode === 'old' && (
        <Field label="Quận / Huyện">
          <Select
            value={districtCode}
            onChange={pickDistrict}
            placeholder="Chọn quận/huyện"
            disabled={!province}
          >
            {province?.districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            )) ?? null}
          </Select>
        </Field>
      )}

      <Field label="Phường / Xã">
        {mode === 'old' ? (
          <Select
            value={wardCode}
            onChange={pickWardOld}
            placeholder="Chọn phường/xã"
            disabled={!district}
          >
            {district?.wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            )) ?? null}
          </Select>
        ) : (
          <Select
            value={wardCode}
            onChange={pickWardNew}
            placeholder="Chọn phường/xã"
            disabled={!province}
          >
            {flatWards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name} <span className="text-muted-foreground">— {w.districtName}</span>
              </option>
            ))}
          </Select>
        )}
      </Field>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
