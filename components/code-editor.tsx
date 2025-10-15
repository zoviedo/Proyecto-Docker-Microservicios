"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Loader2, Rocket, Code2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const PYTHON_ROBLE_TEMPLATE = `
def obtener_token(client, payload):
    email = payload.get('email')
    password = payload.get('password')
    project_id = client.project_id

    if not email or not password:
        raise ValueError("Se requiere 'email' y 'password' en el payload.")
    if not project_id:
        raise ValueError("Se requiere un 'Identificador del Proyecto'.")

    auth_url = f"https://roble-api.openlab.uninorte.edu.co/auth/{project_id}/login"

    response = client.http.post(auth_url, json={'email': email, 'password': password})
    response.raise_for_status()

    return response.json()
`

const PYTHON_NO_ROBLE_TEMPLATE = `
def sumar_desde_json(payload):
  a = payload.get('a', 0)
  b = payload.get('b', 0)

  if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
    raise TypeError("Los parámetros 'a' y 'b' deben ser números.")

  resultado = a + b
  return { "resultado": resultado }
`

interface CodeEditorProps {
  onDeploySuccess?: () => void
  editingMicroserviceId?: string | null
  onEditComplete?: () => void
}

export function CodeEditor({ onDeploySuccess, editingMicroserviceId, onEditComplete }: CodeEditorProps) {
  const [name, setName] = useState("")
  const language = "python"
  const [code, setCode] = useState(PYTHON_ROBLE_TEMPLATE)
  const [isRoble, setIsRoble] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalName, setOriginalName] = useState<string | null>(null)
  const { toast } = useToast()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    if (editingMicroserviceId) {
      setIsEditMode(true)
      loadMicroserviceCode(editingMicroserviceId)
    } else {
      setIsEditMode(false)
      setName("")
      setCode(isRoble ? PYTHON_ROBLE_TEMPLATE : PYTHON_NO_ROBLE_TEMPLATE)
      setOriginalName(null)
    }
  }, [editingMicroserviceId])

  const loadMicroserviceCode = async (id: string) => {
    try {
      const response = await fetch(`${backendUrl}/microservices/${id}/code`)
      if (!response.ok) throw new Error("Error al cargar el código")

      const data = await response.json()
      setName(data.name)
      setCode(data.code)
      setIsRoble(data.isRoble ?? true)
      setOriginalName(data.name)
      toast({ title: "Modo Edición", description: `Cargado código de: ${data.name}` })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo cargar el código", variant: "destructive" })
    }
  }

  const handleRobleChange = (checked: boolean) => {
    setIsRoble(checked)
    if (!isEditMode && language === "python") {
      setCode(checked ? PYTHON_ROBLE_TEMPLATE : PYTHON_NO_ROBLE_TEMPLATE)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) {
      toast({ title: "Error", description: "Nombre y código son requeridos", variant: "destructive" })
      return
    }
    setIsDeploying(true)

    try {
      const url = isEditMode ? `${backendUrl}/microservices/${editingMicroserviceId}` : `${backendUrl}/microservices`
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, language, isRoble }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ocurrió un error")
      }

      toast({ title: isEditMode ? "Microservicio Actualizado" : "Microservicio Desplegado" })

      if (isEditMode) {
        onEditComplete?.()
      } else {
        onDeploySuccess?.()
      }

      setName("")
      setCode(isRoble ? PYTHON_ROBLE_TEMPLATE : PYTHON_NO_ROBLE_TEMPLATE)
      setIsEditMode(false)
      setOriginalName(null)
    } catch (error) {
      toast({
        title: `Error al ${isEditMode ? "actualizar" : "desplegar"}`,
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleCancelEdit = () => {
    onEditComplete?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          {isEditMode ? "Editar Microservicio" : "Editor de Código"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Modifica el código y guarda los cambios para redesplegar el microservicio"
            : "Escribe el código de tu microservicio y despliégalo en un contenedor Docker"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditMode && (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Estás editando: <strong>{originalName}</strong>. Los cambios reemplazarán la versión actual.
              </span>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancelar Edición
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Microservicio</Label>
            <Input
              id="name"
              placeholder="ej: filtro-estudiantes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Lenguaje</Label>
            <Input id="language" value="Python (Flask)" disabled />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="roble-mode" className="text-base">
              Microservicio de Roble
            </Label>
            <p className="text-sm text-muted-foreground">Activa si la función necesita interactuar con Roble.</p>
          </div>
          <Switch id="roble-mode" checked={isRoble} onCheckedChange={handleRobleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Textarea
            id="code"
            className="font-mono text-sm min-h-[300px]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={isDeploying} className="w-full" size="lg">
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? "Actualizando..." : "Desplegando..."}
            </>
          ) : (
            <>
              {isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Rocket className="mr-2 h-4 w-4" />}{" "}
              {isEditMode ? "Guardar Cambios" : "Desplegar Microservicio"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}