import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AuthSidebarWrapper } from "@/app/components/auth-sidebar-wrapper"  

const apiKeys = [
  {
    name: "Production API Key",
    key: "sk_prod_**********************",
    created: "2024-03-01",
    lastUsed: "2 hours ago",
  },
  {
    name: "Development API Key",
    key: "sk_dev_**********************",
    created: "2024-02-15",
    lastUsed: "5 days ago",
  },
]

export default function ApiKeysPage() {
  return (
    <AuthSidebarWrapper>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">API Keys</h3>
        <Button>Generate New Key</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <TableRow key={apiKey.name}>
              <TableCell>{apiKey.name}</TableCell>
              <TableCell>{apiKey.key}</TableCell>
              <TableCell>{apiKey.created}</TableCell>
              <TableCell>{apiKey.lastUsed}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  Revoke
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </AuthSidebarWrapper>
  )
} 