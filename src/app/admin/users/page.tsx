'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Calendar,
  Shield,
  User,
  Mail
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressBadge } from '@/components/admin/WordPressBadge';
import { WordPressTable, WordPressTableHeader, WordPressTableBody, WordPressTableRow, WordPressTableCell, WordPressTableHeaderCell } from '@/components/admin/WordPressTable';
import { UserManagementService } from '@/lib/userManagementService';
import { AdminUser, UserRole } from '@/types/user';
import { formatDate } from '@/utils/formatDate';
import { useUser } from '@/contexts/UserContext';

export default function UsersPage() {
  const { user, isLoading: userLoading } = useUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as UserRole,
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!userLoading && user) {
      loadUsers();
    }
  }, [userLoading, user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await UserManagementService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setMessage(null);
      
      if (editingUser) {
        // Atualizar usuário existente
        await UserManagementService.updateUser(editingUser.uid, {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
          isActive: formData.isActive
        });
        
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
      } else {
        // Criar novo usuário
        await UserManagementService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive
        });
        
        setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
      }
      
      // Recarregar lista de usuários
      await loadUsers();
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao salvar usuário' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    // Não permitir edição de super_admin
    if (user.role === 'super_admin') {
      setMessage({ type: 'error', text: 'Usuários super admin não podem ser editados' });
      return;
    }
    
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userId: string) => {
    // Encontrar o usuário para verificar o role
    const userToDelete = users.find(u => u.uid === userId);
    
    // Não permitir exclusão de super_admin
    if (userToDelete?.role === 'super_admin') {
      setMessage({ type: 'error', text: 'Usuários super admin não podem ser excluídos' });
      return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await UserManagementService.deleteUser(userId);
      setMessage({ type: 'success', text: 'Usuário excluído com sucesso!' });
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao excluir usuário' 
      });
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    // Não permitir alteração de status de super_admin
    if (user.role === 'super_admin') {
      setMessage({ type: 'error', text: 'Status de usuários super admin não pode ser alterado' });
      return;
    }
    
    try {
      await UserManagementService.toggleUserStatus(user.uid);
      setMessage({ type: 'success', text: 'Status do usuário alterado com sucesso!' });
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao alterar status do usuário' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'editor',
      isActive: true
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.uid));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <WordPressBadge variant="error">Administrador</WordPressBadge>;
      case 'editor':
        return <WordPressBadge variant="info">Editor</WordPressBadge>;
      default:
        return <WordPressBadge variant="default">{role}</WordPressBadge>;
    }
  };

  if (userLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        </div>
        <WordPressCard>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </WordPressCard>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        </div>
        <WordPressCard>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-500">Você precisa estar logado para acessar esta página.</p>
          </div>
        </WordPressCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie usuários administradores</p>
        </div>
        <WordPressButton onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </WordPressButton>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex justify-between items-center">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <WordPressCard title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={editingUser ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Selecionar função do usuário"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Usuário ativo
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <WordPressButton type="button" variant="secondary" onClick={resetForm} disabled={isSaving}>
                Cancelar
              </WordPressButton>
              <WordPressButton type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')} Usuário
              </WordPressButton>
            </div>
          </form>
        </WordPressCard>
      )}

      {/* Filters */}
      <WordPressCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar usuários"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'editor')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por função"
            >
              <option value="all">Todas as funções</option>
              <option value="admin">Administradores</option>
              <option value="editor">Editores</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por status"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </WordPressCard>

      {/* Users Table */}
      <WordPressCard>
        <WordPressTable>
          <WordPressTableHeader>
            <WordPressTableRow>
              <WordPressTableHeaderCell className="w-12">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Selecionar todos os usuários"
                />
              </WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Usuário</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Função</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Status</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Último Login</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Data de Criação</WordPressTableHeaderCell>
              <WordPressTableHeaderCell className="w-12">Ações</WordPressTableHeaderCell>
            </WordPressTableRow>
          </WordPressTableHeader>
          <WordPressTableBody>
            {filteredUsers.map((user) => (
              <WordPressTableRow key={user.uid} isSelected={selectedUsers.includes(user.uid)}>
                <WordPressTableCell>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.uid)}
                    onChange={() => handleSelectUser(user.uid)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Selecionar usuário ${user.name}`}
                  />
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    {getRoleBadge(user.role)}
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <WordPressBadge variant={user.isActive ? 'success' : 'warning'}>
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </WordPressBadge>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {user.lastLoginAt 
                        ? formatDate(user.lastLoginAt.toISOString())
                        : 'Nunca'
                      }
                    </span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDate(user.createdAt.toISOString())}
                    </span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    {user.role !== 'super_admin' && (
                      <WordPressButton
                        variant="tertiary"
                        size="small"
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </WordPressButton>
                    )}
                    {user.role !== 'super_admin' && (
                      <WordPressButton
                        variant="tertiary"
                        size="small"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </WordPressButton>
                    )}
                    {user.role !== 'super_admin' && (
                      <WordPressButton
                        variant="tertiary"
                        size="small"
                        onClick={() => handleDelete(user.uid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </WordPressButton>
                    )}
                    {user.role === 'super_admin' && (
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        Protegido
                      </span>
                    )}
                  </div>
                </WordPressTableCell>
              </WordPressTableRow>
            ))}
          </WordPressTableBody>
        </WordPressTable>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando seu primeiro usuário.'
              }
            </p>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
              <WordPressButton onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </WordPressButton>
            )}
          </div>
        )}
      </WordPressCard>
    </div>
  );
}
