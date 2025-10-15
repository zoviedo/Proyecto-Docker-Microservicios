"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/code-editor"
import { MicroservicesList } from "@/components/microservices-list"
import { TestPanel } from "@/components/test-panel"
import { Terminal } from "lucide-react"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingMicroserviceId, setEditingMicroserviceId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("editor")

  const handleDeploySuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEdit = (id: string) => {
    setEditingMicroserviceId(id)
    setActiveTab("editor")
  }

  const handleEditComplete = () => {
    setEditingMicroserviceId(null)
    setRefreshTrigger((prev) => prev + 1)
    setActiveTab("services")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Plataforma de Microservicios</h1>
              <p className="text-sm text-muted-foreground">
                Crea, despliega y gestiona microservicios en contenedores Docker
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="services">Microservicios</TabsTrigger>
            <TabsTrigger value="test">Pruebas</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-6">
            <CodeEditor
              onDeploySuccess={handleDeploySuccess}
              editingMicroserviceId={editingMicroserviceId}
              onEditComplete={handleEditComplete}
            />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <MicroservicesList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
          </TabsContent>

          <TabsContent value="test" className="mt-6">
            <TestPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}