import VIETNAM_DATA from './vietnam-db.json';

export const VIETNAM_PROVINCES = VIETNAM_DATA.map((p: any) => ({
    name: p.name,
    districts: p.level2s.map((d: any) => ({
        name: d.name,
        wards: d.level3s.map((w: any) => w.name)
    }))
}));
