export interface Container {
  id: number;
  no: string;           
  type: string;         
  loc: string;        
  status: string;      
}

export interface Transport {
  id: number;
  ref: string;                  
  containerNo: string;
  containerId: number | null;
  vehicleType: string;
  vehicleNo: string;
  ngayKhoiHanh: string;           
  eta: string;                
  status: string;
}

export interface Cargo {
  id: number;
  desc: string;        
  container: string;
  qty: string;          
  type: string;       
}

export interface Partner {
  id: number;
  name: string;
  type: string;        
  contact: string;      
  status: string;       
}

export interface Staff {
  id: number;
  name: string;
  role: string;         
  contact: string;
  status: string;      
}

export interface Contract {
  id: number;
  no: string;           
  partner: string;
  start: string;
  end: string;
  value: number;
  status: string;      
  note?: string;
}

export interface Invoice {
  id: number;
  no: string;           
  contractNo: string;
  container?: string;
  partner: string;
  issue: string;      
  due: string;          
  amount: number;
  vat: number;
  total: number;
  paid: string;       
  paidDate?: string;
  note?: string;
}

export interface Finance {
  id: number;
  container: string;
  base: number;         
  demdet: number;       
  local: number;        
  extra: number;        
  total: number;
}

export interface AppDB {
  containers: Container[];
  cargo: Cargo[];
  transports: Transport[];
  partners: Partner[];
  staff: Staff[];
  contracts: Contract[];
  invoices: Invoice[];
  finance: Finance[];
  vehicles: Vehicle[];
}

export interface Vehicle {
  PhuongTienID: number;        
  LoaiPhuongTien: string;       
  BienSo: string;          
  TaiTrong: number;               
  TrangThai: string;              
  MoTa: string | null;            
}