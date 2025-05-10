import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Shield, UserCog, Users, AlertTriangle, Filter, RefreshCw } from "lucide-react";
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

// Tipos para nuestro sistema
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  company_id: string | null;
  company_name: string | null;
}

interface Company {
  id: string;
  nombre: string;
  identificador_fiscal: string;
}

// Roles del sistema
const SYSTEM_ROLES = [
  { id: 'superadmin', name: 'Super Administrador', description: 'Control total del sistema' },
  { id: 'admin', name: 'Administrador', description: 'Gestión de usuarios y configuraciones' },
  { id: 'despachante', name: 'Despachante', description: 'Gestión de despachos aduaneros' },
  { id: 'exportador', name: 'Exportador', description: 'Gestión de exportaciones' },
  { id: 'importador', name: 'Importador', description: 'Gestión de importaciones' },
  { id: 'logistica', name: 'Logística', description: 'Seguimiento y coordinación logística' },
  { id: 'financiero', name: 'Financiero', description: 'Gestión de pagos y liquidaciones' },
  { id: 'visualizador', name: 'Visualizador', description: 'Solo visualización de datos' }
];

// Permisos por módulo
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

const PERMISSIONS: Permission[] = [
  // Módulo de Despachos
  { id: 'despachos.view', name: 'Ver despachos', description: 'Ver listados y detalles de despachos', module: 'despachos' },
  { id: 'despachos.create', name: 'Crear despachos', description: 'Crear nuevos despachos aduaneros', module: 'despachos' },
  { id: 'despachos.edit', name: 'Editar despachos', description: 'Modificar despachos existentes', module: 'despachos' },
  { id: 'despachos.delete', name: 'Eliminar despachos', description: 'Eliminar despachos del sistema', module: 'despachos' },
  { id: 'despachos.approve', name: 'Aprobar despachos', description: 'Aprobar despachos para procesamiento', module: 'despachos' },
  
  // Módulo de Documentos
  { id: 'documentos.view', name: 'Ver documentos', description: 'Ver documentos y archivos', module: 'documentos' },
  { id: 'documentos.upload', name: 'Subir documentos', description: 'Cargar nuevos documentos', module: 'documentos' },
  { id: 'documentos.download', name: 'Descargar documentos', description: 'Descargar documentos existentes', module: 'documentos' },
  { id: 'documentos.delete', name: 'Eliminar documentos', description: 'Eliminar documentos del sistema', module: 'documentos' },
  
  // Módulo de Logística
  { id: 'logistica.view', name: 'Ver logística', description: 'Ver información logística', module: 'logistica' },
  { id: 'logistica.create', name: 'Crear envíos', description: 'Crear nuevos envíos', module: 'logistica' },
  { id: 'logistica.edit', name: 'Editar envíos', description: 'Modificar información de envíos', module: 'logistica' },
  { id: 'logistica.track', name: 'Seguimiento avanzado', description: 'Acceso a seguimiento detallado', module: 'logistica' },
  
  // Módulo Financiero
  { id: 'financiero.view', name: 'Ver financiero', description: 'Ver información financiera', module: 'financiero' },
  { id: 'financiero.create', name: 'Crear pagos', description: 'Registrar pagos y cobros', module: 'financiero' },
  { id: 'financiero.approve', name: 'Aprobar operaciones', description: 'Aprobar operaciones financieras', module: 'financiero' },
  { id: 'financiero.liquidacion', name: 'Liquidación divisas', description: 'Gestionar liquidaciones de divisas', module: 'financiero' },
  
  // Módulo de Reportes
  { id: 'reportes.basicos', name: 'Reportes básicos', description: 'Acceso a reportes básicos', module: 'reportes' },
  { id: 'reportes.avanzados', name: 'Reportes avanzados', description: 'Acceso a reportes avanzados', module: 'reportes' },
  { id: 'reportes.export', name: 'Exportar reportes', description: 'Exportar reportes a Excel/PDF', module: 'reportes' },
  
  // Módulo de Administración
  { id: 'admin.users', name: 'Gestión de usuarios', description: 'Administrar usuarios', module: 'admin' },
  { id: 'admin.companies', name: 'Gestión de empresas', description: 'Administrar empresas', module: 'admin' },
  { id: 'admin.permisos', name: 'Gestión de permisos', description: 'Administrar permisos', module: 'admin' },
  { id: 'admin.config', name: 'Configuración sistema', description: 'Configurar parámetros del sistema', module: 'admin' },
  { id: 'admin.logs', name: 'Ver logs', description: 'Acceso a logs del sistema', module: 'admin' },
];

const PermissionManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  // Filtrar usuarios cuando cambia el término de búsqueda o filtros
  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, companyFilter, users]);

  // Debouncear la búsqueda para mejor rendimiento
  const handleSearchChange = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  // Obtener usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          email,
          full_name,
          role,
          is_active,
          created_at,
          last_sign_in_at,
          companies (
            id,
            nombre
          )
        `)
        .limit(100);

      if (error) throw error;

      const formattedUsers: User[] = data.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        company_id: user.companies ? user.companies.id : null,
        company_name: user.companies ? user.companies.nombre : null
      }));

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Obtener empresas
  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, nombre, identificador_fiscal')
        .order('nombre');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    }
  };

  // Filtrar usuarios según criterios
  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user => 
          user.email.toLowerCase().includes(term) ||
          user.full_name.toLowerCase().includes(term) ||
          (user.company_name && user.company_name.toLowerCase().includes(term))
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (companyFilter) {
      filtered = filtered.filter(user => user.company_id === companyFilter);
    }

    setFilteredUsers(filtered);
  };

  // Cargar detalles del usuario seleccionado
  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    
    try {
      // Cargar permisos del usuario
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const userPermissions = data.map(p => p.permission_id);
      setSelectedPermissions(userPermissions);
      
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar permisos del usuario');
    }
  };

  // Manejo de permisos
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(current => {
      if (current.includes(permissionId)) {
        return current.filter(id => id !== permissionId);
      } else {
        return [...current, permissionId];
      }
    });
  };

  // Aplicar permisos predefinidos según el rol
  const applyRoleTemplate = (role: string) => {
    // Define permisos predeterminados por rol
    let defaultPermissions: string[] = [];
    
    switch (role) {
      case 'superadmin':
        // Todos los permisos
        defaultPermissions = PERMISSIONS.map(p => p.id);
        break;
      case 'admin':
        // Permisos de administración y visualización
        defaultPermissions = PERMISSIONS.filter(p => 
          p.module === 'admin' || 
          p.id.includes('.view') || 
          p.id.includes('reportes')
        ).map(p => p.id);
        break;
      case 'despachante':
        // Permisos específicos para despachantes
        defaultPermissions = [
          'despachos.view', 'despachos.create', 'despachos.edit', 'despachos.approve',
          'documentos.view', 'documentos.upload', 'documentos.download',
          'logistica.view', 'logistica.track',
          'reportes.basicos', 'reportes.export'
        ];
        break;
      case 'exportador':
        // Permisos para exportadores
        defaultPermissions = [
          'despachos.view', 'despachos.create',
          'documentos.view', 'documentos.upload', 'documentos.download',
          'logistica.view', 'logistica.create',
          'financiero.view', 'financiero.liquidacion',
          'reportes.basicos', 'reportes.export'
        ];
        break;
      case 'importador':
        // Permisos para importadores
        defaultPermissions = [
          'despachos.view', 'despachos.create',
          'documentos.view', 'documentos.upload', 'documentos.download',
          'logistica.view', 'logistica.create',
          'financiero.view', 'financiero.create',
          'reportes.basicos', 'reportes.export'
        ];
        break;
      case 'logistica':
        // Permisos para personal de logística
        defaultPermissions = [
          'despachos.view',
          'documentos.view', 'documentos.download',
          'logistica.view', 'logistica.create', 'logistica.edit', 'logistica.track',
          'reportes.basicos', 'reportes.export'
        ];
        break;
      case 'financiero':
        // Permisos para personal financiero
        defaultPermissions = [
          'despachos.view',
          'documentos.view',
          'financiero.view', 'financiero.create', 'financiero.approve', 'financiero.liquidacion',
          'reportes.basicos', 'reportes.avanzados', 'reportes.export'
        ];
        break;
      case 'visualizador':
        // Solo permisos de visualización
        defaultPermissions = [
          'despachos.view',
          'documentos.view',
          'logistica.view',
          'reportes.basicos'
        ];
        break;
    }
    
    setSelectedPermissions(defaultPermissions);
    setSelectedRole(role);
  };

  // Guardar cambios
  const saveUserPermissions = async () => {
    if (!selectedUser) return;
    
    setSaveLoading(true);
    
    try {
      // 1. Actualizar rol del usuario
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', selectedUser.id);
      
      if (roleError) throw roleError;
      
      // 2. Eliminar permisos actuales
      const { error: deleteError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', selectedUser.id);
      
      if (deleteError) throw deleteError;
      
      // 3. Insertar nuevos permisos
      if (selectedPermissions.length > 0) {
        const permissionsToInsert = selectedPermissions.map(permId => ({
          user_id: selectedUser.id,
          permission_id: permId
        }));
        
        const { error: insertError } = await supabase
          .from('user_permissions')
          .insert(permissionsToInsert);
        
        if (insertError) throw insertError;
      }
      
      // 4. Registrar en auditoría
      await supabase
        .from('audit_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          table_name: 'user_permissions',
          record_id: selectedUser.id,
          operation: 'UPDATE',
          new_data: {
            role: selectedRole,
            permissions: selectedPermissions
          }
        });
      
      // 5. Actualizar lista de usuarios con el nuevo rol
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? {...user, role: selectedRole} 
          : user
      ));
      
      toast.success('Permisos actualizados correctamente');
      
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      toast.error('Error al guardar los permisos');
    } finally {
      setSaveLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('es-AR');
  };

  // Renderizado de roles como badges
  const getRoleBadge = (role: string) => {
    const colorMap: Record<string, string> = {
      superadmin: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      despachante: 'bg-blue-100 text-blue-800',
      exportador: 'bg-green-100 text-green-800',
      importador: 'bg-emerald-100 text-emerald-800',
      logistica: 'bg-amber-100 text-amber-800',
      financiero: 'bg-cyan-100 text-cyan-800',
      visualizador: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={`${colorMap[role] || 'bg-gray-100 text-gray-800'} hover:${colorMap[role] || 'bg-gray-200'}`}>
        {SYSTEM_ROLES.find(r => r.id === role)?.name || role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestión de Permisos</h2>
            <p className="text-sm text-muted-foreground">
              Administre usuarios y sus permisos en el sistema
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Permisos</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Gestione los usuarios del sistema y sus roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center border rounded-md pl-3 flex-1">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input 
                    placeholder="Buscar por nombre, email o empresa..." 
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px] flex gap-1 h-10">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los roles</SelectItem>
                      {SYSTEM_ROLES.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="w-[200px] h-10">
                      <SelectValue placeholder="Filtrar por empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las empresas</SelectItem>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon" onClick={fetchUsers} title="Refrescar">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[450px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                          </div>
                          <div className="mt-2">Cargando usuarios...</div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <p className="text-muted-foreground">No se encontraron usuarios que coincidan con los criterios.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow 
                          key={user.id}
                          className={`${selectedUser?.id === user.id ? 'bg-muted/50' : ''} cursor-pointer`}
                          onClick={() => handleSelectUser(user)}
                        >
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.company_name || 
                              <span className="text-muted-foreground italic text-xs">Sin empresa</span>
                            }
                          </TableCell>
                          <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectUser(user);
                                setCurrentTab('permissions');
                              }}
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Permisos
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Permisos de Usuario</CardTitle>
              <CardDescription>
                Configure los permisos para el usuario seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedUser ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">Seleccione un usuario para configurar sus permisos</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentTab('users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ver listado de usuarios
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border rounded-md p-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Usuario:</h3>
                        <p className="font-semibold">{selectedUser.full_name}</p>
                        <p className="text-sm">{selectedUser.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Empresa:</h3>
                        <p>{selectedUser.company_name || <span className="italic text-muted-foreground">Sin empresa</span>}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role">Rol del Usuario</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Select value={selectedRole} onValueChange={applyRoleTemplate}>
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {SYSTEM_ROLES.map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <p className="text-sm text-muted-foreground">
                          {SYSTEM_ROLES.find(r => r.id === selectedRole)?.description || 
                            'Seleccione un rol para aplicar permisos predefinidos'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-4">Permisos por Módulo</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Agrupar permisos por módulo */}
                        {Array.from(new Set(PERMISSIONS.map(p => p.module))).map(module => (
                          <div key={module} className="border rounded-md p-4">
                            <h4 className="text-sm font-semibold capitalize mb-3">{module}</h4>
                            <div className="space-y-2">
                              {PERMISSIONS.filter(p => p.module === module).map(permission => (
                                <div key={permission.id} className="flex items-start space-x-2">
                                  <Checkbox 
                                    id={permission.id}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <div className="grid gap-1.5 leading-none">
                                    <Label 
                                      htmlFor={permission.id}
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      {permission.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {selectedUser && (
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setCurrentTab('users')}>
                  Volver al listado
                </Button>
                <Button onClick={saveUserPermissions} disabled={saveLoading}>
                  {saveLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionManager; 