from fastapi import APIRouter, HTTPException
import time
import asyncio


def get_health_router(mistral_client, flux_client):
    router = APIRouter()

    @router.get("/health/mistral")
    async def check_mistral_health():
        start_time = time.time()
        try:
            await asyncio.wait_for(
                mistral_client.check_health(),
                timeout=5.0
            )

            latency = (time.time() - start_time) * 1000

            return {
                "status": "healthy",
                "service": "mistral",
                "latency": latency
            }

        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=str(e)
            )

    @router.get("/health/flux")
    async def check_flux_health():
        start_time = time.time()
        try:
            is_healthy, status = await asyncio.wait_for(
                flux_client.check_health(),
                timeout=5.0
            )

            latency = (time.time() - start_time) * 1000

            if is_healthy:
                return {
                    "status": "healthy",
                    "service": "flux",
                    "latency": latency
                }
            else:
                raise HTTPException(status_code=503, detail=status)

        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=str(e)
            )

    return router