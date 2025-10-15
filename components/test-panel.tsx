"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, FlaskConical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Microservice {
  id: string
  name: string
  endpoint: string
  status: string
  isRoble: boolean
}

const DEFAULT_PARAMS = JSON.stringify({}, null, 2)

export function TestPanel() {
  const [microservices, setMicroservices] = useState<Microservice[]>([])
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedMicroservice, setSelectedMicroservice] = useState<Microservice | null>(null)
  const [token, setToken] = useState("")
  const [projectId, setProjectId] = useState("")
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [response, setResponse] = useState<string>("")
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const fetchMicroservices = async () => {
    try {
      const response = await fetch(`${backendUrl}/microservices`)
      if (!response.ok) throw new Error("Error al cargar microservicios")
      const data = await response.json()
      setMicroservices(data.filter((ms: Microservice) => ms.status === "running"))
    } catch (error) {
      console.error("Error fetching microservices:", error)
    }
  }

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId)
    const service = microservices.find((ms) => ms.id === serviceId)
    setSelectedMicroservice(service || null)
  }

  useEffect(() => {
    fetchMicroservices()
  }, [])

  const handleTest = async () => {
    if (!selectedService) {
      toast({ title: "Error", description: "Selecciona un microservicio", variant: "destructive" })
      return
    }

    if (selectedMicroservice?.isRoble && !projectId.trim()) {
      toast({
        title: "Error",
        description: "Este microservicio de Roble requiere un Identificador del Proyecto.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    setResponse("")

    try {
      const service = microservices.find((ms) => ms.id === selectedService)
      if (!service) throw new Error("Microservicio no encontrado")

      let parsedParams = {}
      try {
        if (params.trim()) parsedParams = JSON.parse(params)
      } catch {
        throw new Error("Los parámetros deben ser JSON válido")
      }

      const headers: HeadersInit = { "Content-Type": "application/json" }

      if (token.trim()) {
        const authToken = token.trim().startsWith("Bearer ") ? token.trim() : `Bearer ${token.trim()}`
        headers["Authorization"] = authToken
      }

      const body = {
        project_id: projectId,
        payload: parsedParams
      }

      const testResponse = await fetch(service.endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      })

      const data = await testResponse.json()
      setResponse(JSON.stringify(data, null, 2))

      if (!testResponse.ok) {
        toast({
          title: "Respuesta con Error",
          description: data.error || `Status: ${testResponse.status}`,
          variant: "destructive",
        })
      } else {
        toast({ title: "Prueba Exitosa" })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setResponse(JSON.stringify({ error: errorMessage }, null, 2))
      toast({ title: "Error en la Prueba", description: errorMessage, variant: "destructive" })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Panel de Pruebas
        </CardTitle>
        <CardDescription>Prueba tus microservicios desplegados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service">Microservicio</Label>
          <Select value={selectedService} onValueChange={handleServiceChange}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Selecciona un microservicio" />
            </SelectTrigger>
            <SelectContent>
              {microservices.length === 0 ? (
                <SelectItem value="none" disabled>
                  No hay microservicios activos
                </SelectItem>
              ) : (
                microservices.map((ms) => (
                  <SelectItem key={ms.id} value={ms.id}>
                    {ms.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedMicroservice?.isRoble && (
          <>
            <div className="space-y-2">
              <Label htmlFor="projectId">Identificador del Proyecto (Requerido para Roble)</Label>
              <Input
                id="projectId"
                type="text"
                placeholder="ej: pc2_32edb2e47f"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Token de Acceso</Label>
              <Input
                id="token"
                type="text"
                placeholder="Pega tu token de acceso aquí..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="params">Parámetros (JSON)</Label>
          <Textarea
            id="params"
            className="font-mono text-sm min-h-[150px]"
            value={params}
            onChange={(e) => setParams(e.target.value)}
          />
        </div>

        <Button onClick={handleTest} disabled={isTesting || !selectedService} className="w-full">
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Probando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Enviar Prueba
            </>
          )}
        </Button>

        {response && (
          <div className="space-y-2">
            <Label>Respuesta</Label>
            <Textarea className="font-mono text-sm min-h-[200px]" value={response} readOnly />
          </div>
        )}
      </CardContent>
    </Card>
  )
}