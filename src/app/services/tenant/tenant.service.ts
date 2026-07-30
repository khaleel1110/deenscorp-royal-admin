import {Injectable, signal} from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  private currentEnvTenantId = environment.tenant.tenantId;
  private currentEnvTenantName = environment.tenant.name;
  private currentEnvTenant = environment.tenant;
  currentTenantId = signal(this.currentEnvTenantId);
  currentTenantName = signal(this.currentEnvTenantName);

}
